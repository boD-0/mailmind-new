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
    defaultHeaders['X-Title'] = 'MailMind - A/B Test'
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
    const { topic, count = 5, context, model } = body

    // Input size limits
    if (topic && typeof topic === 'string' && topic.length > 500) {
      return NextResponse.json({ error: 'Topic too long (max 500 characters)' }, { status: 400 });
    }
    if (context && typeof context === 'string' && context.length > 5000) {
      return NextResponse.json({ error: 'Context too long (max 5000 characters)' }, { status: 400 });
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const client = getClient()
    // Validate model against allowlist; fall back to default if invalid
    const selectedModel = (model && typeof model === 'string' && ALLOWED_MODELS.includes(model))
      ? model
      : (process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

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
