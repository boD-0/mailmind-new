import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildAureliusSystemPrompt } from '@/lib/aurelius/prompt'
import { getToolDefinitions } from '@/lib/aurelius/tools/definitions'
import { executeToolCall } from '@/lib/aurelius/tools/runner'
import { auth } from '@/lib/auth/auth'

// Allow streaming responses up to 120 seconds (tools may take time)
export const maxDuration = 120

/** Get the authenticated user ID from the request headers */
async function getUserId(request: Request): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    return session?.user?.id || null
  } catch {
    return null
  }
}

// ── OpenAI-compatible client (OpenRouter / any OpenAI-compatible endpoint) ──

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing API key. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env')
  }

  const baseURL = process.env.OPENROUTER_API_KEY
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1'

  const defaultHeaders: Record<string, string> = {}

  if (process.env.OPENROUTER_API_KEY) {
    defaultHeaders['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    defaultHeaders['X-Title'] = 'MailMind - Aurelius'
  }

  return new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders,
  })
}

// ── Default model selection ──

function getDefaultModel(): string {
  if (process.env.AURELIUS_MODEL) return process.env.AURELIUS_MODEL
  if (process.env.OPENROUTER_API_KEY) return 'openai/gpt-4o-mini'
  return 'gpt-4o-mini'
}

/**
 * Models known to NOT support tool/function calling.
 * All other models are assumed to support it.
 * Update this list when new non-supporting models are encountered.
 */
const NON_TOOL_MODELS = [
  'o1-mini',
  'o1-preview',
  'o3-mini',
]

function supportsToolCalling(model: string): boolean {
  // Tools require at least GPT-4 class function calling or equivalent
  // Assume most modern models support it; only exclude known non-supporting ones
  return !NON_TOOL_MODELS.some((m) => model.includes(m))
}

/**
 * Create a ReadableStream from an OpenAI streaming completion.
 */
function createStreamFromOpenAI(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Stream error occurred'
        controller.enqueue(encoder.encode(`\n\n[Error: ${errorMessage}]`))
        controller.close()
      }
    },
  })
}

// ── POST handler ──

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the authenticated user for DB tool scoping
    const userId = await getUserId(request)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Build system prompt with current context + brand profile
    const systemPrompt = buildAureliusSystemPrompt({
      pathname: context?.pathname || '/dashboard',
      swarmStatus: context?.swarmStatus || 'idle',
      confidenceScore: context?.confidenceScore || 0,
      activeAgent: context?.activeAgent || null,
      brand: context?.brand || undefined,
    })

    // Prepare messages for the LLM
    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt } as const,
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content,
      })),
    ]

    const client = getClient()
    const model = getDefaultModel()
    const canUseTools = supportsToolCalling(model)

    if (canUseTools) {
      // ── Step 1: Non-streaming call with tools ──
      const tools = getToolDefinitions({ includeWrite: true, includeDb: true })

      const initialResponse = await client.chat.completions.create({
        model,
        messages: apiMessages,
        tools,
        tool_choice: 'auto',
        stream: false,
        max_tokens: 2048,
        temperature: 0.7,
      })

      const choice = initialResponse.choices[0]
      if (!choice) {
        return NextResponse.json({ error: 'No response from model' }, { status: 500 })
      }

      // If the model decided to call tools, execute them
      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
        try {
          // Execute all tool calls (only function-type calls are supported)
          const toolResults: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
          const functionCalls = choice.message.tool_calls.filter(
            (tc): tc is OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { function: { name: string; arguments: string } } =>
              tc.type === 'function'
          )
          for (const toolCall of functionCalls) {
            const toolResult = await executeToolCall(toolCall, { userId: userId || undefined })
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: toolResult,
            })
          }

          // ── Step 2: Streaming call with tool results ──
          const stream = await client.chat.completions.create({
            model,
            messages: [
              ...apiMessages,
              choice.message,
              ...toolResults,
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          })

          const readableStream = createStreamFromOpenAI(stream)
          return new Response(readableStream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no',
            },
          })
        } catch (toolError) {
          // Tool execution failed — tell the model about it
          const errorMsg = toolError instanceof Error ? toolError.message : 'Unknown tool execution error'
          console.error('Tool execution error:', toolError)

          // Send the error to the model so it can respond gracefully
          const firstToolCall = choice.message.tool_calls[0]
          const errorToolCallId = firstToolCall?.id || 'call_error'
          const stream = await client.chat.completions.create({
            model,
            messages: [
              ...apiMessages,
              choice.message,
              {
                role: 'tool',
                tool_call_id: errorToolCallId,
                content: `Error executing tool: ${errorMsg}`,
              },
            ],
            stream: true,
            max_tokens: 2048,
            temperature: 0.7,
          })

          const readableStream = createStreamFromOpenAI(stream)
          return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      }

      // No tool calls — wrap the text content in a stream for client compatibility
      const content = choice.message?.content || ''
      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(content))
          controller.close()
        },
      })

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    // ── Fallback: models that don't support tools — stream directly ──
    const stream = await client.chat.completions.create({
      model,
      messages: apiMessages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    })

    const readableStream = createStreamFromOpenAI(stream)
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Aurelius API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
