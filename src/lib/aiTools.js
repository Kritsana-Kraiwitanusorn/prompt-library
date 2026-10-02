export const DEFAULT_AI_TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', color: '#10A37F', icon: '🤖', description: 'OpenAI GPT-4o / Reasoning' },
  { id: 'claude', name: 'Claude', color: '#D97706', icon: '🧠', description: 'Anthropic Claude 3.5 / 3.7 Sonnet' },
  { id: 'gemini', name: 'Gemini', color: '#4F46E5', icon: '✨', description: 'Google Gemini 2.5 / Flash' },
  { id: 'deepseek', name: 'DeepSeek', color: '#0284C7', icon: '🐋', description: 'DeepSeek V3 / R1 Reasoning' },
  { id: 'cursor', name: 'Cursor', color: '#6366F1', icon: '⚡', description: 'Cursor AI Code Editor' },
  { id: 'copilot', name: 'Copilot', color: '#2563EB', icon: '🛸', description: 'GitHub Copilot' },
  { id: 'midjourney', name: 'Midjourney', color: '#EC4899', icon: '🎨', description: 'Midjourney Image Generation' },
  { id: 'perplexity', name: 'Perplexity', color: '#0D9488', icon: '🔍', description: 'Perplexity AI Search' },
  { id: 'v0', name: 'v0', color: '#1A1A1A', icon: '▲', description: 'v0 by Vercel Generative UI' },
]

const STORAGE_KEY = 'prompt_library_ai_tools'

export function getAiTools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_AI_TOOLS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {}
  return DEFAULT_AI_TOOLS
}

export function saveAiTools(tools) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
    window.dispatchEvent(new Event('ai-tools-changed'))
  } catch {}
}

export function resetAiTools() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('ai-tools-changed'))
  } catch {}
  return DEFAULT_AI_TOOLS
}

/**
 * Extracts AI Tool identifier/name from a skill object.
 * Checks both skill.ai_tool and tags formatted as "tool:XYZ".
 */
export function extractAiToolFromSkill(skill) {
  if (!skill) return null
  if (skill.ai_tool && typeof skill.ai_tool === 'string' && skill.ai_tool.trim()) {
    return skill.ai_tool.trim()
  }
  const tags = skill.tags ?? []
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.startsWith('tool:')) {
      const val = tag.slice(5).trim()
      if (val) return val
    }
  }
  return null
}

/**
 * Strips tool:* tags from a tags array to leave only user tags.
 */
export function stripAiToolTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags.filter((t) => typeof t === 'string' && !t.startsWith('tool:'))
}

/**
 * Combines user tags with a chosen AI tool encoded as tool:ToolName.
 */
export function combineTagsWithAiTool(userTags, aiTool) {
  const clean = stripAiToolTags(userTags)
  if (aiTool && typeof aiTool === 'string' && aiTool.trim()) {
    clean.push(`tool:${aiTool.trim()}`)
  }
  return clean
}

/**
 * Returns metadata (name, color, icon) for an AI tool name or ID.
 */
export function getAiToolMeta(toolNameOrId, toolsList = getAiTools()) {
  if (!toolNameOrId) return null
  const query = toolNameOrId.trim().toLowerCase()

  // Find exact id or name match
  const found = toolsList.find(
    (t) => t.id.toLowerCase() === query || t.name.toLowerCase() === query || t.name.toLowerCase().includes(query)
  )

  if (found) return found

  // Generate deterministic fallback color
  let hash = 0
  for (let i = 0; i < toolNameOrId.length; i++) {
    hash = toolNameOrId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const fallbackColors = ['#10A37F', '#D97706', '#4F46E5', '#0284C7', '#6366F1', '#EC4899', '#0D9488']
  const color = fallbackColors[Math.abs(hash) % fallbackColors.length]

  return {
    id: query.replace(/\s+/g, '-'),
    name: toolNameOrId.trim(),
    color,
    icon: '🤖',
  }
}
