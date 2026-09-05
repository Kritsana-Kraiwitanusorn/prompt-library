import { useMemo } from 'react'

export const SORT_OPTIONS = [
  { value: 'default', label: 'ค่าเริ่มต้น (ปักหมุดก่อน)' },
  { value: 'updated_desc', label: 'แก้ไขล่าสุด' },
  { value: 'updated_asc', label: 'แก้ไขนานสุด' },
  { value: 'title_asc', label: 'ชื่อ A–Z' },
]

export function getAllTags(prompts) {
  const set = new Set()
  for (const p of prompts) {
    for (const t of p.tags ?? []) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'th'))
}

export function useFilteredPrompts(prompts, filters) {
  const { search, categoryId, tags, quick, sort, status } = filters

  return useMemo(() => {
    const q = search.trim().toLowerCase()

    let result = prompts.filter((p) => {
      if (categoryId && p.category_id !== categoryId) return false
      if (status && (p.status ?? 'draft') !== status) return false
      if (quick === 'favorite' && !p.is_favorite) return false
      if (quick === 'pinned' && !p.is_pinned) return false
      if (tags.length > 0) {
        const promptTags = p.tags ?? []
        const hasAll = tags.every((t) => promptTags.includes(t))
        if (!hasAll) return false
      }
      if (q) {
        const haystack = [p.title, p.content, p.category?.name, ...(p.tags ?? [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    if (sort === 'updated_desc') {
      result = [...result].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    } else if (sort === 'updated_asc') {
      result = [...result].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
    } else if (sort === 'title_asc') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'th'))
    }
    // 'default' keeps the server order (pinned first, then most recently updated)

    return result
  }, [prompts, search, categoryId, tags, quick, sort, status])
}
