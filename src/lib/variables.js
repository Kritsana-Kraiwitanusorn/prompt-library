const VAR_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g

// Returns the unique variable names found, in first-seen order.
export function extractVariables(content) {
  if (!content) return []
  const seen = new Set()
  const names = []
  for (const match of content.matchAll(VAR_PATTERN)) {
    const name = match[1].trim()
    if (name && !seen.has(name)) {
      seen.add(name)
      names.push(name)
    }
  }
  return names
}

// Replaces every {{name}} with values[name]; missing values become an
// empty string rather than leaving the literal placeholder behind.
export function fillVariables(content, values) {
  return content.replace(VAR_PATTERN, (_match, rawName) => {
    const name = rawName.trim()
    return values[name] ?? ''
  })
}
