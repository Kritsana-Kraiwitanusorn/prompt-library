import { useState, useEffect, useCallback } from 'react'
import { getAiTools, saveAiTools, resetAiTools } from '../lib/aiTools'

export function useAiTools() {
  const [tools, setTools] = useState(getAiTools)

  useEffect(() => {
    function handleChange() {
      setTools(getAiTools())
    }
    window.addEventListener('ai-tools-changed', handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener('ai-tools-changed', handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  const addTool = useCallback((tool) => {
    const current = getAiTools()
    const id = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${Date.now()}`
    const next = [...current, { ...tool, id }]
    saveAiTools(next)
    setTools(next)
    return next
  }, [])

  const updateTool = useCallback((id, updates) => {
    const current = getAiTools()
    const next = current.map((t) => (t.id === id ? { ...t, ...updates } : t))
    saveAiTools(next)
    setTools(next)
    return next
  }, [])

  const deleteTool = useCallback((id) => {
    const current = getAiTools()
    const next = current.filter((t) => t.id !== id)
    saveAiTools(next)
    setTools(next)
    return next
  }, [])

  const reset = useCallback(() => {
    const next = resetAiTools()
    setTools(next)
    return next
  }, [])

  return {
    tools,
    addTool,
    updateTool,
    deleteTool,
    reset,
  }
}
