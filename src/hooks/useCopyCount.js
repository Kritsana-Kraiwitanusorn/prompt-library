import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'prompt-library-copy-counts'

function loadCounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCounts(counts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))
  } catch {
    // non-fatal: localStorage full or unavailable
  }
}

export function useCopyCount() {
  const [counts, setCounts] = useState(loadCounts)

  // Sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setCounts(loadCounts())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const increment = useCallback((promptId) => {
    setCounts((prev) => {
      const next = { ...prev, [promptId]: (prev[promptId] ?? 0) + 1 }
      saveCounts(next)
      return next
    })
  }, [])

  const getCount = useCallback((promptId) => counts[promptId] ?? 0, [counts])

  return { counts, increment, getCount }
}
