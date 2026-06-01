import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { tieredAiRateLimit } from '@/lib/rate-limit';
import { abTestSchema, validateBody } from '@/lib/validate';
import { sanitizeAiInput } from '@/lib/sanitize';

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

  // Tiered rate limit: FREE=3/min, STARTER=10/min, PROFESSIONAL=30/min
  const rateLimitResult = await tieredAiRateLimit(user.plan, user.id);
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

  try {    const body = await request.json();

    // Zod validation
    const parsed = validateBody(abTestSchema, body);
    if (parsed instanceof NextResponse) return parsed;
    const { topic, count, context, model } = parsed;

    // Prompt injection sanitization on topic
    const topicCheck = sanitizeAiInput(topic);
    if (!topicCheck.clean) {
      return NextResponse.json(
        { error: `Prompt injection detected in topic: ${topicCheck.reason}` },
        { status: 400 },
      );
    }

    // Sanitize context if provided
    const safeContext = context ? sanitizeAiInput(context) : null;
    if (safeContext && !safeContext.clean) {
      return NextResponse.json(
        { error: `Prompt injection detected in context: ${safeContext.reason}` },
        { status: 400 },
      );
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

    const userPrompt = safeContext?.sanitized
      ? `Topic: ${topicCheck.sanitized}\n\nContext: ${safeContext.sanitized}`
      : `Topic: ${topicCheck.sanitized}`

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
