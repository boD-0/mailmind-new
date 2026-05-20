/**
 * Database tool implementations for Aurelius.
 * Each tool queries or mutates the database via Drizzle ORM,
 * scoped to the authenticated user.
 */

import { db } from '@/db/drizzle'
import { projects, swarmExecutions, vaultDocuments } from '@/db/schema'
import { eq, desc, like, and, or } from 'drizzle-orm'
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

      default:
        return `[Error: Unknown DB tool "${toolName}".]`
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return `[Error executing "${toolName}": ${message}]`
  }
}
