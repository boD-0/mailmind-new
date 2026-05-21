import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { aiGenerationRateLimit } from '@/lib/rate-limit';

export const maxDuration = 30

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing API key. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env')
  }

  const isOpenRouter = !!process.env.OPENROUTER_API_KEY
  const baseURL = isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1'

  const defaultHeaders: Record<string, string> = {}
  if (isOpenRouter) {
    defaultHeaders['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    defaultHeaders['X-Title'] = 'MailMind - Sequence Builder'
  }

  return new OpenAI({ apiKey, baseURL, defaultHeaders })
}

// Allowed models (prevent users from requesting expensive/unsupported models)
const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o", "openai/gpt-4o-mini", "openai/gpt-4o"];

export async function POST(request: Request) {
  // Require authentication
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  // Rate limit AI generation: 10 requests/min per user
  const rateLimitResult = await aiGenerationRateLimit(user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'AI generation limit reached. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      },
    );
  }

  try {    const body = await request.json()
    const { topic, context, steps = 4, model } = body

    // Input size limits
    if (topic && typeof topic === 'string' && topic.length > 500) {
      return NextResponse.json({ error: 'Topic too long (max 500 characters)' }, { status: 400 });
    }
    if (context && typeof context === 'string' && context.length > 5000) {
      return NextResponse.json({ error: 'Context too long (max 5000 characters)' }, { status: 400 });
    }

    if (!topic && !context) {
      return NextResponse.json(
        { error: 'Either a topic or context is required' },
        { status: 400 }
      )
    }

    const client = getClient()
    // Validate model against allowlist; fall back to default if invalid
    const selectedModel = (model && typeof model === 'string' && ALLOWED_MODELS.includes(model))
      ? model
      : (process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

    const systemPrompt = `You are an expert email marketing strategist. Create a follow-up email sequence with ${Math.min(Math.max(steps, 1), 8)} steps.

For each step, provide:
- A short title (e.g., "Follow-up", "Value Add", "Objection Handling")
- The email body (2-4 sentences, conversational but professional)

Rules:
- The sequence should feel natural and not pushy
- Each step should have a distinct angle or purpose
- Use line breaks: first line is the title, then an empty line, then the body
- Separate steps with "---" on its own line
- No numbering or markdown headers`

    const userPrompt = context
      ? `Campaign context:\n${context.trim()}\n\n${topic ? `Topic: ${topic.trim()}` : ''}`
      : `Topic: ${topic?.trim() || 'General follow-up'}`

    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content?.trim() || ''
    const rawSteps = content.split('---').filter(s => s.trim().length > 0)

    const sequence = rawSteps.map(block => {
      const lines = block.trim().split('\n').filter(l => l.trim().length > 0)
      const title = lines[0]?.replace(/^[\d\-*•]+[.\s)]*\s*/, '').trim() || 'Step'
      const body = lines.slice(1).join(' ').trim() || lines[0]?.trim() || ''
      return { title, body }
    }).filter(s => s.body.length > 0)

    return NextResponse.json({ sequence })
  } catch (error) {
    console.error('Sequence Builder API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
