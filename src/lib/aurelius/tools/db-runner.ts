/**
 * Database tool implementations for Aurelius.
 * Each tool queries or mutates the database via Drizzle ORM,
 * scoped to the authenticated user.
 */

import { db } from '@/db/drizzle'
import { projects, swarmExecutions, vaultDocuments, emailEvents, prospects } from '@/db/schema'
import { eq, desc, like, and, or, count, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/* ── Types ── */

export interface DbToolContext {
  userId: string
}

/* ── Tool Implementations ── */

/**
 * get_brand_profile — Read the user's current brand profile from their project.
 */
async function getBrandProfile(userId: string): Promise<string> {
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .limit(1)

  if (!project[0]) {
    return 'You have not set up a brand profile yet. Go through onboarding to create one.'
  }

  const p = project[0]
  const lines: string[] = ['## Brand Profile\n']
  lines.push(`**Name:** ${p.name}`)
  lines.push(`**Industry:** ${p.industry || 'Not set'}`)
  lines.push(`**Tone of Voice:** ${p.toneOfVoice || 'Not set'}`)
  lines.push(`**Target Audience:** ${p.targetAudience || 'Not set'}`)
  if (p.context) lines.push(`**Context:** ${p.context}`)
  if (p.brandValues?.length) lines.push(`**Brand Values:** ${p.brandValues.join(', ')}`)
  if (p.painPoints?.length) lines.push(`**Pain Points:** ${p.painPoints.join(', ')}`)
  if (p.deadline) lines.push(`**Deadline:** ${p.deadline.toISOString().slice(0, 10)}`)

  return lines.join('\n')
}

export interface UpdateBrandArgs {
  name?: string
  industry?: string
  toneOfVoice?: string
  targetAudience?: string
  context?: string
  brandValues?: string[]
  painPoints?: string[]
}

/**
 * update_brand_profile — Update the user's brand profile settings.
 * Only provided fields are changed; omitted fields stay as-is.
 */
async function updateBrandProfile(userId: string, args: UpdateBrandArgs): Promise<string> {
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, userId))
    .limit(1)

  const updateData: Record<string, unknown> = {}
  if (args.name !== undefined) updateData.name = args.name
  if (args.industry !== undefined) updateData.industry = args.industry
  if (args.toneOfVoice !== undefined) updateData.toneOfVoice = args.toneOfVoice
  if (args.targetAudience !== undefined) updateData.targetAudience = args.targetAudience
  if (args.context !== undefined) updateData.context = args.context
  if (args.brandValues !== undefined) updateData.brandValues = args.brandValues
  if (args.painPoints !== undefined) updateData.painPoints = args.painPoints

  if (Object.keys(updateData).length === 0) {
    return 'No fields to update. Provide at least one field (name, industry, toneOfVoice, etc.).'
  }

  if (existing[0]) {
    await db
      .update(projects)
      .set(updateData as typeof projects.$inferInsert)
      .where(eq(projects.id, existing[0].id))
  } else {
    await db.insert(projects).values({
      userId,
      name: args.name || 'My Brand',
      ...updateData,
    } as typeof projects.$inferInsert)
  }

  revalidatePath('/', 'layout')

  const updated = await getBrandProfile(userId)
  return `✅ Brand profile updated successfully.\n\n${updated}`
}

export interface SearchProjectsArgs {
  query: string
}

/**
 * search_projects — Search the user's projects by name, industry, audience, or context.
 */
async function searchProjects(userId: string, args: SearchProjectsArgs): Promise<string> {
  const { query } = args
  const q = query.trim()
  if (!q || q.length < 2) {
    return 'Please provide at least 2 characters to search.'
  }

  const results = await db
    .select({
      id: projects.id,
      name: projects.name,
      industry: projects.industry,
      targetAudience: projects.targetAudience,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        or(
          like(projects.name, `%${q}%`),
          like(projects.industry ?? '', `%${q}%`),
          like(projects.targetAudience ?? '', `%${q}%`),
          like(projects.context ?? '', `%${q}%`),
        ),
      ),
    )
    .orderBy(desc(projects.createdAt))
    .limit(10)

  if (results.length === 0) {
    return `No projects found matching "${query}".`
  }

  const lines: string[] = [`Found ${results.length} project(s) matching "${query}":\n`]
  for (const p of results) {
    const date = p.createdAt?.toISOString().slice(0, 10) || 'unknown'
    lines.push(`- **${p.name}**  (${date})`)
    if (p.industry) lines.push(`  Industry: ${p.industry}`)
    if (p.targetAudience) lines.push(`  Audience: ${p.targetAudience}`)
  }

  return lines.join('\n')
}

export interface GetSwarmHistoryArgs {
  limit?: number
}

/**
 * get_swarm_history — View recent swarm executions and their results.
 */
async function getSwarmHistory(userId: string, args: GetSwarmHistoryArgs): Promise<string> {
  const limit = Math.min(args.limit || 10, 50)

  const results = await db
    .select()
    .from(swarmExecutions)
    .where(eq(swarmExecutions.userId, userId))
    .orderBy(desc(swarmExecutions.createdAt))
    .limit(limit)

  if (results.length === 0) {
    return 'No swarm executions found. Launch a swarm from the War Room to see results here.'
  }

  const lines: string[] = [`Recent swarm executions (last ${results.length}):\n`]
  for (const s of results) {
    const date = s.createdAt?.toISOString().slice(0, 16).replace('T', ' ') || 'unknown'
    const agents = s.agentsUsed?.join(', ') || 'N/A'
    const statusEmoji = s.status === 'success' ? '✅' : s.status === 'error' ? '❌' : '⏳'
    lines.push(`${statusEmoji} **${date}** — Status: ${s.status}`)
    lines.push(`  Agents: ${agents}`)
    if (s.modelUsed) lines.push(`  Model: ${s.modelUsed}`)
    if (s.tokensUsed) lines.push(`  Tokens: ${s.tokensUsed}`)
    if (s.durationMs) lines.push(`  Duration: ${(s.durationMs / 1000).toFixed(1)}s`)
    if (s.inputPrompt) lines.push(`  Input: ${s.inputPrompt.slice(0, 120)}${s.inputPrompt.length > 120 ? '...' : ''}`)
    if (s.outputResult) lines.push(`  Output: ${s.outputResult.slice(0, 200)}${s.outputResult.length > 200 ? '...' : ''}`)
    lines.push('')
  }

  return lines.join('\n').trim()
}

export interface GetVaultDocumentsArgs {
  limit?: number
}

/**
 * get_vault_documents — List the user's uploaded vault documents.
 */
async function getVaultDocuments(userId: string, args: GetVaultDocumentsArgs): Promise<string> {
  const limit = Math.min(args.limit || 20, 50)

  const results = await db
    .select()
    .from(vaultDocuments)
    .where(eq(vaultDocuments.userId, userId))
    .orderBy(desc(vaultDocuments.createdAt))
    .limit(limit)

  if (results.length === 0) {
    return 'No documents in the vault. Upload files from the Vault section to see them here.'
  }

  const lines: string[] = [`Vault documents (${results.length}):\n`]
  for (const d of results) {
    const date = d.createdAt?.toISOString().slice(0, 10) || 'unknown'
    const size = d.fileSize
      ? d.fileSize > 1024
        ? `${(d.fileSize / 1024).toFixed(1)} KB`
        : `${d.fileSize} B`
      : 'unknown size'
    lines.push(`- **${d.fileName}**  (${size}, ${date})`)
    if (d.mimeType) lines.push(`  Type: ${d.mimeType}`)
  }

  return lines.join('\n')
}

/**
 * get_campaign_insights — Analyze email events and swarm executions to surface
 * personalized coaching insights (open rate, reply rate, top agent, etc.).
 */
async function getCampaignInsights(userId: string): Promise<string> {
  // Aggregate email events
  const eventRows = await db
    .select({ eventType: emailEvents.eventType, cnt: count() })
    .from(emailEvents)
    .where(eq(emailEvents.userId, userId))
    .groupBy(emailEvents.eventType)

  const eventCounts: Record<string, number> = {}
  for (const r of eventRows) {
    if (r.eventType) eventCounts[r.eventType] = r.cnt
  }

  const totalSent = Object.values(eventCounts).reduce((a, b) => a + b, 0) || 0
  const opens = eventCounts['open'] || 0
  const replies = eventCounts['reply'] || 0
  const clicks = eventCounts['click'] || 0
  const avgOpenRate = totalSent > 0 ? Math.round((opens / totalSent) * 100) : 0
  const avgReplyRate = totalSent > 0 ? Math.round((replies / totalSent) * 100) : 0

  // Agent performance
  const swarmRows = await db
    .select({ agentsUsed: swarmExecutions.agentsUsed, status: swarmExecutions.status })
    .from(swarmExecutions)
    .where(eq(swarmExecutions.userId, userId))
    .orderBy(desc(swarmExecutions.createdAt))
    .limit(30)

  const successfulSwarms = swarmRows.filter((r) => r.status === 'success')
  const agentCounts: Record<string, number> = {}
  for (const s of successfulSwarms) {
    for (const agent of s.agentsUsed || []) {
      agentCounts[agent] = (agentCounts[agent] || 0) + 1
    }
  }

  let topAgent = 'N/A'
  let topAgentCount = 0
  for (const [agent, cnt] of Object.entries(agentCounts)) {
    if (cnt > topAgentCount) { topAgentCount = cnt; topAgent = agent }
  }

  // Prospect count
  const prospectRows = await db
    .select({ cnt: count() })
    .from(prospects)
    .where(eq(prospects.userId, userId))
  const prospectCount = prospectRows[0]?.cnt ?? 0

  const lines: string[] = ['## Campaign Insights\n']
  lines.push(`📊 **Total Emails Sent:** ${totalSent}`)
  lines.push(`📬 **Open Rate:** ${avgOpenRate}% (${opens} opens)`)
  lines.push(`💬 **Reply Rate:** ${avgReplyRate}% (${replies} replies)`)
  lines.push(`🖱️ **Clicks:** ${clicks}`)
  lines.push(`🤖 **Total Swarms:** ${swarmRows.length} (${successfulSwarms.length} successful)`)
  if (topAgent !== 'N/A') lines.push(`⭐ **Top Agent:** ${topAgent} (${topAgentCount}x in successful swarms)`)
  lines.push(`👤 **Prospects Saved:** ${prospectCount}`)

  // Coaching recommendations
  if (totalSent >= 3) {
    lines.push('\n### 💡 Coaching Suggestions\n')

    if (avgOpenRate < 20 && avgOpenRate > 0) {
      lines.push('- Your open rate is below 20%. Try shorter subject lines (under 7 words) and include the prospect name.')
    } else if (avgOpenRate >= 40) {
      lines.push('- Excellent open rates! Your subject lines are working well.')
    }

    if (avgReplyRate < 5 && avgReplyRate > 0) {
      lines.push('- Reply rate is low. Consider using deeper OCEAN profiling (enable Psychologist agent) for stronger personalization.')
    } else if (avgReplyRate >= 15) {
      lines.push('- Strong reply rates — your personalization strategy is clearly effective.')
    }

    if (clicks > 0 && opens > 0 && (clicks / opens) < 0.1) {
      lines.push('- People open but rarely click. Strengthen your CTA and value proposition in the first two sentences.')
    }

    if (topAgent !== 'N/A' && topAgentCount >= 2) {
      lines.push(`- ${topAgent} is your MVP agent (${topAgentCount} successful campaigns). Consider giving it more influence in Swarm params.`)
    }
  } else {
    lines.push('\n*Not enough data for coaching insights yet. Launch 2-3 more Swarm campaigns to unlock personalized recommendations.*')
  }

  return lines.join('\n')
}

/**
 * search_prospects — Search the user's prospect database.
 */
export interface SearchProspectsArgs {
  query: string
}

async function searchProspects(userId: string, args: SearchProspectsArgs): Promise<string> {
  const q = args.query.trim()
  if (!q || q.length < 2) return 'Please provide at least 2 characters to search.'

  const rows = await db
    .select({ name: prospects.name, email: prospects.email, company: prospects.company, lastContactedAt: prospects.lastContactedAt })
    .from(prospects)
    .where(
      and(
        eq(prospects.userId, userId),
        or(
          like(prospects.name, `%${q}%`),
          like(prospects.email ?? '', `%${q}%`),
          like(prospects.company ?? '', `%${q}%`),
        ),
      ),
    )
    .orderBy(desc(prospects.updatedAt))
    .limit(10)

  if (rows.length === 0) return `No prospects found matching "${q}".`

  const lines: string[] = [`Found ${rows.length} prospect(s) matching "${q}":\n`]
  for (const p of rows) {
    const lastContact = p.lastContactedAt ? ` (last contacted ${p.lastContactedAt.toISOString().slice(0, 10)})` : ''
    lines.push(`- **${p.name}**${p.company ? ` — ${p.company}` : ''}${p.email ? ` · ${p.email}` : ''}${lastContact}`)
  }
  return lines.join('\n')
}

/* ── Main Executor ── */

export async function executeDbTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: DbToolContext,
): Promise<string> {
  try {
    switch (toolName) {
      case 'get_brand_profile':
        return getBrandProfile(ctx.userId)

      case 'update_brand_profile':
        return updateBrandProfile(ctx.userId, args as unknown as UpdateBrandArgs)

      case 'search_projects':
        return searchProjects(ctx.userId, args as unknown as SearchProjectsArgs)

      case 'get_swarm_history':
        return getSwarmHistory(ctx.userId, args as unknown as GetSwarmHistoryArgs)

      case 'get_vault_documents':
        return getVaultDocuments(ctx.userId, args as unknown as GetVaultDocumentsArgs)

      case 'get_campaign_insights':
        return getCampaignInsights(ctx.userId)

      case 'search_prospects':
        return searchProspects(ctx.userId, args as unknown as SearchProspectsArgs)

      default:
        return `[Error: Unknown DB tool "${toolName}".]`
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return `[Error executing "${toolName}": ${message}]`
  }
}
