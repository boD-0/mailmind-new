/**
 * Tool definitions for Aurelius — enables the AI assistant to search,
 * read, list, and modify the project codebase directly from chat,
 * as well as query and update the database (brand profile, projects, swarms, vault).
 *
 * Each tool follows OpenAI's function calling schema v2 format.
 */

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

/* ── Codebase Tools ── */

export const CODEBASE_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_codebase',
      description:
        'Search the entire project codebase for files containing a query string. Uses grep with regex support. Case-sensitive by default. Returns matching file paths, line numbers, and the matching lines (max results configurable).',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query. Supports regex patterns (e.g., "useEffect", "function foo", "TODO|FIXME").',
          },
          filePattern: {
            type: 'string',
            description:
              'Optional file glob pattern to filter results (e.g., "*.ts", "*.tsx", "src/**/*.css"). Defaults to all source files.',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of matching lines to return (default 20, max 60).',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_files',
      description:
        'Read one or more files from the project. Returns the full content of each file with its path as a header. Use this to inspect files before suggesting modifications.',
      parameters: {
        type: 'object',
        properties: {
          paths: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Array of file paths relative to the project root (e.g., ["src/app/page.tsx", "src/lib/utils.ts"]). Max 5 files per call.',
          },
        },
        required: ['paths'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description:
        'List files and directories inside a given project path. Use this to explore the project structure and find relevant files.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Directory path relative to the project root (e.g., "src/components", "src/lib/aurelius"). Use "." for the root directory.',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_files_by_name',
      description:
        'Search for files by their name using a glob-like pattern. Use this when you know the approximate name of a file but not its exact path (e.g., "**/*route*", "**/*.css", "**/layout*", "**/chat*").',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description:
              'File name pattern. Supports * (any chars) and ** (any depth). Examples: "**/*.ts", "**/route.ts", "**/*Chat*", "src/**/*.tsx".',
          },
        },
        required: ['pattern'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description:
        'Create a new file or overwrite an existing file in the project. **IMPORTANT**: Always ask the user for confirmation before writing or overwriting any file. Provide a summary of the changes you plan to make and wait for approval.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to the project root (e.g., "src/components/Foo.tsx"). Must stay within the project.',
          },
          content: {
            type: 'string',
            description: 'The full file content to write.',
          },
          description: {
            type: 'string',
            description: 'Brief, one-line description of what this change does (e.g., "Add Button component with hover states").',
          },
        },
        required: ['path', 'content', 'description'],
      },
    },
  },
]

/* ── Database Tools ── */

export const DB_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_brand_profile',
      description:
        'Read the user\'s brand profile (name, industry, tone of voice, target audience, values, pain points, deadline). Use this to understand the user\'s business context before giving advice.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_brand_profile',
      description:
        'Update one or more fields in the user\'s brand profile. Only the fields you provide will change — omitted fields stay as they are. **IMPORTANT**: Always ask the user to confirm changes before calling this tool.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Brand name (e.g., "MailMind").',
          },
          industry: {
            type: 'string',
            description: 'Industry (e.g., "SaaS / Tehnologie").',
          },
          toneOfVoice: {
            type: 'string',
            description: 'Tone of voice for communication (e.g., "Profesional dar prietenos").',
          },
          targetAudience: {
            type: 'string',
            description: 'Target audience description.',
          },
          context: {
            type: 'string',
            description: 'Additional context, slogan, or mission statement.',
          },
          brandValues: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of brand values (e.g., ["Inovație", "Calitate"]). Replaces the entire list.',
          },
          painPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of pain points (e.g., ["Rata de răspuns scăzută", "Personalizare insuficientă"]). Replaces the entire list.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_projects',
      description:
        'Search the user\'s projects/campaigns by name, industry, target audience, or context text. Returns matching projects with their creation date, industry, and audience. Minimum 2 characters.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (min 2 characters). Searches across project name, industry, audience, and context.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_swarm_history',
      description:
        'View recent AI swarm executions. Returns status, agents used, model, tokens consumed, duration, and input/output snippets for each run. Use this to review past campaign creation attempts and their outcomes.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of recent executions to return (max 50, default 10).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_vault_documents',
      description:
        'List files in the user\'s Vault (cloud file storage). Returns file names, sizes, types, and upload dates. Use this to help the user find or reference their uploaded assets.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of documents to return (max 50, default 20).',
          },
        },
        required: [],
      },
    },
  },
]

/* ── Combined Export ── */

export const ALL_TOOLS: ToolDefinition[] = [...CODEBASE_TOOLS, ...DB_TOOLS]

/**
 * Get tool definitions — optionally include write_file and/or DB tools.
 * By default returns codebase tools (without write_file) + all DB tools.
 *
 * @param opts - Options object, OR a boolean for backward compatibility
 *   (where `true` means include write_file, `false` means exclude it).
 */
export function getToolDefinitions(
  opts?: { includeWrite?: boolean; includeDb?: boolean } | boolean,
): ToolDefinition[] {
  // Handle legacy boolean signature: getToolDefinitions(true)
  if (typeof opts === 'boolean') {
    opts = { includeWrite: opts, includeDb: true }
  }
  const { includeWrite = false, includeDb = true } = opts || {}

  const codebase = includeWrite
    ? CODEBASE_TOOLS
    : CODEBASE_TOOLS.filter((t) => t.function.name !== 'write_file')

  if (!includeDb) return codebase

  return [...codebase, ...DB_TOOLS]
}
