/**
 * Tool execution engine for Aurelius.
 * Runs the actual tool implementations server-side.
 */

import { execSync } from 'child_process'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs'
import { join, resolve } from 'path'
import { executeDbTool } from './db-runner'

const PROJECT_ROOT = process.cwd()

/**
 * Ensure a resolved path stays within the project root (prevent path traversal).
 */
function safeResolve(filePath: string): string {
  const resolved = resolve(PROJECT_ROOT, filePath)
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`Path traversal detected: "${filePath}" resolves outside the project root.`)
  }
  return resolved
}

/**
 * Strip ANSI escape codes from grep output.
 */
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
}

/**
 * Run a shell command and return its stdout. Throws on non-zero exit.
 */
function runCommand(cmd: string, timeoutMs = 10_000): string {
  try {
    const output = execSync(cmd, {
      cwd: PROJECT_ROOT,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024, // 1 MB
      encoding: 'utf-8',
    })
    return output.toString()
  } catch (err: unknown) {
    // When encoding is set, execSync provides stdout as string on error
    if (err instanceof Error && 'stdout' in err) {
      const stdout = (err as { stdout: string | Buffer }).stdout
      return String(stdout)
    }
    throw err
  }
}

/* ── Tool Implementations ── */

interface SearchCodebaseArgs {
  query: string
  filePattern?: string
  maxResults?: number
}

function searchCodebase(args: SearchCodebaseArgs): string {
  const { query, filePattern, maxResults = 20 } = args
  const limit = Math.min(maxResults, 60)

  // Build grep command
  // Include all common source file types
  const includePatterns = [
    '*.ts',
    '*.tsx',
    '*.js',
    '*.jsx',
    '*.css',
    '*.json',
    '*.md',
    '*.html',
    '*.sql',
    '*.yaml',
    '*.yml',
    '*.mjs',
  ]

  // Use user's filePattern override if provided
  // Both filePattern and the default patterns are escaped with single quotes for shell safety
  let includeArgs: string
  if (filePattern) {
    const safePattern = filePattern.replace(/'/g, "'\\''")
    includeArgs = `--include='${safePattern}'`
  } else {
    includeArgs = includePatterns.map((p) => `--include="${p}"`).join(' ')
  }

  // Escape the query for shell safety (single-quote wrapping)
  // Replace single quotes with: end-quote + escaped-quote + begin-quote
  const safeQuery = query.replace(/'/g, "'\\''")

  // grep flags: -r recursive, -n line numbers, -I ignore binary, -s suppress errors
  // Note: safeQuery is wrapped in single quotes which prevent all shell interpretation
  const cmd = `grep -rnI -s ${includeArgs} -m 5 . -e '${safeQuery}' 2>/dev/null | head -${limit}`

  const raw = stripAnsi(runCommand(cmd))

  if (!raw.trim()) {
    return `No results found for query: "${query}"${filePattern ? ` in files matching: ${filePattern}` : ''}`
  }

  const lines = raw.split('\n').filter(Boolean)
  const truncated = lines.length > limit ? lines.slice(0, limit) : lines

  // Format results: group by file
  const fileMap = new Map<string, string[]>()
  for (const line of truncated) {
    const firstColon = line.indexOf(':')
    if (firstColon === -1) continue
    const filePath = line.slice(0, firstColon)
    const rest = line.slice(firstColon + 1)
    if (!fileMap.has(filePath)) fileMap.set(filePath, [])
    fileMap.get(filePath)!.push(rest)
  }

  // Truncate results per file
  const summaryLines: string[] = [`Found ${lines.length} matches in ${fileMap.size} files:`]
  for (const [file, matches] of fileMap) {
    const displayMatches = matches.slice(0, 5)
    for (const match of displayMatches) {
      summaryLines.push(`  ${file}:${match}`)
    }
    if (matches.length > 5) {
      summaryLines.push(`  ... (${matches.length - 5} more in ${file})`)
    }
  }

  if (raw.split('\n').filter(Boolean).length > limit) {
    summaryLines.push(`\n(Results truncated to ${limit} lines. Narrow your search for more specific results.)`)
  }

  return summaryLines.join('\n')
}

interface ReadFileArgs {
  paths: string[]
}

function readFiles(args: ReadFileArgs): string {
  const { paths } = args
  const results: string[] = []

  for (const filePath of paths.slice(0, 5)) {
    try {
      const safePath = safeResolve(filePath)
      if (!existsSync(safePath)) {
        results.push(`\n=== ${filePath} ===\n[File not found: ${filePath}]`)
        continue
      }
      const content = readFileSync(safePath, 'utf-8')
      results.push(`\n=== ${filePath} ===\n${content}`)
    } catch (err) {
      results.push(`\n=== ${filePath} ===\n[Error reading file: ${err}]`)
    }
  }

  return results.join('\n').trim() || 'No files provided.'
}

interface ListDirectoryArgs {
  path: string
}

function listDirectoryContents(args: ListDirectoryArgs): string {
  const { path } = args
  try {
    const safePath = safeResolve(path)
    if (!existsSync(safePath)) {
      return `[Directory not found: ${path}]`
    }
    const entries = readdirSync(safePath, { withFileTypes: true })
    const files: string[] = []
    const dirs: string[] = []

    for (const entry of entries) {
      const fullPath = join(path, entry.name)
      if (entry.name.startsWith('.') && entry.name !== '.env.example') continue
      if (entry.isDirectory()) {
        dirs.push(`  📁 ${fullPath}/`)
      } else {
        const stats = statSync(join(safePath, entry.name))
        const size = stats.size > 1024 ? `${(stats.size / 1024).toFixed(1)} KB` : `${stats.size} B`
        files.push(`  📄 ${fullPath}  (${size})`)
      }
    }

    const out: string[] = [`Contents of "${path}":`]
    if (dirs.length) out.push('', 'Directories:', ...dirs)
    if (files.length) out.push('', 'Files:', ...files)
    if (!dirs.length && !files.length) out.push('  (empty)')

    return out.join('\n')
  } catch (err) {
    return `[Error listing directory: ${err}]`
  }
}

interface SearchFilesByNameArgs {
  pattern: string
}

function searchFilesByName(args: SearchFilesByNameArgs): string {
  const { pattern } = args

  // Split pattern into directory prefix and filename
  // Pattern examples: "**/*.ts", "src/**/*.tsx", "**/route.ts"
  const parts = pattern.split('/')
  const fileNamePart = parts[parts.length - 1] || '*'

  // Escape for shell safety
  const safeName = fileNamePart.replace(/'/g, "'\\''")

  // Build find command
  // find . -type f -iname 'filename' is already recursive, handling all ** patterns
  // If the user specified a directory prefix, use it as a -path hint
  let pathHint = ''
  if (parts.length > 1) {
    // Take the first significant directory segment as a path hint
    const dirHint = parts.slice(0, -1).find((p) => p !== '**')
    if (dirHint) {
      const safeDir = dirHint.replace(/'/g, "'\\''")
      pathHint = `-path '*/${safeDir}/*'`
    }
  }

  const pathExcludes = "-not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*'"
  const cmd = `find . -type f ${pathExcludes} -iname '${safeName}' ${pathHint} 2>/dev/null | head -40`

  const raw = runCommand(cmd)

  if (!raw.trim()) {
    return `No files found matching pattern: "${pattern}"`
  }

  const lines = raw.split('\n').filter(Boolean).slice(0, 40)
  const summary = [`Found ${lines.length} file(s) matching "${pattern}":`]
  for (const line of lines) {
    summary.push(`  📄 ${line}`)
  }
  if (lines.length >= 40) {
    summary.push('(Results truncated to 40 files. Use a more specific pattern.)')
  }

  return summary.join('\n')
}

interface WriteFileArgs {
  path: string
  content: string
  description: string
}

function writeFileTool(args: WriteFileArgs): string {
  const { path, content, description } = args

  // Validate path stays within project
  const safePath = safeResolve(path)

  // Ensure parent directory exists
  const parentDir = resolve(safePath, '..')
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true })
  }

  // Write the file
  writeFileSync(safePath, content, 'utf-8')

  return `✅ File written: ${path}\nDescription: ${description}\nSize: ${content.length} bytes`
}

/* ── Main Executor ── */

export interface ToolResult {
  name: string
  result: string
}

/**
 * Execute a single tool call from the LLM and return its result as a string.
 *
 * Accepts any tool call shape with { function: { name, arguments } }.
 * For database tools, a valid userId must be provided in the context.
 */
export async function executeToolCall(
  toolCall: {
    id: string
    function: { name: string; arguments: string }
    type?: string
  },
  options?: {
    userId?: string
  },
): Promise<string> {
  const { name, arguments: rawArgs } = toolCall.function

  let args: Record<string, unknown>
  try {
    args = JSON.parse(rawArgs)
  } catch {
    return `[Error: Failed to parse arguments for tool "${name}". Received: ${rawArgs}]`
  }

  try {
    switch (name) {
      /* ── Codebase tools ── */
      case 'search_codebase':
        return searchCodebase(args as unknown as SearchCodebaseArgs)

      case 'read_files':
        return readFiles(args as unknown as ReadFileArgs)

      case 'list_directory':
        return listDirectoryContents(args as unknown as ListDirectoryArgs)

      case 'search_files_by_name':
        return searchFilesByName(args as unknown as SearchFilesByNameArgs)

      case 'write_file':
        return writeFileTool(args as unknown as WriteFileArgs)

      /* ── Database tools ── */
      case 'get_brand_profile':
      case 'update_brand_profile':
      case 'search_projects':
      case 'get_swarm_history':
      case 'get_vault_documents': {
        if (!options?.userId) {
          return `[Error: Cannot execute "${name}" without a valid user session. Please log in first.]`
        }
        return executeDbTool(name, args, { userId: options.userId })
      }

      default:
        return `[Error: Unknown tool "${name}". Available tools: search_codebase, read_files, list_directory, search_files_by_name, write_file, get_brand_profile, update_brand_profile, search_projects, get_swarm_history, get_vault_documents]`
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return `[Error executing "${name}": ${message}]`
  }
}
