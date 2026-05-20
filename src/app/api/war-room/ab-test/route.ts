import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 30

function getClient(apiKeyOverride?: string, provider?: string) {
  const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing API key. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env')
  }

  const isOpenRouter = provider === 'openrouter' || (!apiKeyOverride && !!process.env.OPENROUTER_API_KEY)
  const baseURL = isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1'

  const defaultHeaders: Record<string, string> = {}
  if (isOpenRouter) {
    defaultHeaders['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    defaultHeaders['X-Title'] = 'MailMind - A/B Test'
  }

  return new OpenAI({ apiKey, baseURL, defaultHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, count = 5, context, apiKey, provider, model } = body

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const client = getClient(apiKey, provider)
    const selectedModel = model || (provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini')

    const systemPrompt = `You are an expert copywriter specializing in email marketing subject lines.
Generate ${Math.min(Math.max(count, 1), 10)} compelling subject line variants for the given topic.

Rules:
- Each variant must be a single line, no numbering or bullet points
- Mix of curiosity, urgency, personalization, and value-proposition angles
- Keep each subject line under 70 characters
- Return ONLY the variants, one per line, no commentary
- No empty lines in the response`

    const userPrompt = context
      ? `Topic: ${topic.trim()}\n\nContext: ${context.trim()}`
      : `Topic: ${topic.trim()}`

    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    })

    const content = response.choices[0]?.message?.content?.trim() || ''
    const variants = content
      .split('\n')
      .map(line => line.replace(/^[\d\-*•]+[.\s)]*\s*/, '').trim())
      .filter(line => line.length > 0 && line.length < 150)

    return NextResponse.json({ variants })
  } catch (error) {
    console.error('A/B Test API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
