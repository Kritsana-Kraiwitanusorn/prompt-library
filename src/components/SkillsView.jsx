import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Star,
  Pin,
  MoreHorizontal,
  Download,
  Upload,
  ChevronDown,
  X,
  Tag,
  Search,
} from 'lucide-react'
import {
  useSkillsQuery,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useImportSkills,
} from '../hooks/useSkills'
import { exportSkillsAsJson } from '../lib/skills'
import SkillFormModal from './SkillFormModal'
import SkillPreviewModal from './SkillPreviewModal'
import ConfirmDialog from './ConfirmDialog'
import EmptyState from './EmptyState'
import ActionSheet from './ActionSheet'

const TAG_PREVIEW_COUNT = 8

function formatRelative(dateStr) {
  if (!dateStr) return 'เมื่อสักครู่'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ชม.ที่แล้ว`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} วันที่แล้ว`
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SkillsView({ showToast }) {
  const skillsQuery = useSkillsQuery()
  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const deleteSkill = useDeleteSkill()
  const importSkills = useImportSkills()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [previewSkill, setPreviewSkill] = useState(null)
  const [sheetSkill, setSheetSkill] = useState(null)
  const [toolbarSheetOpen, setToolbarSheetOpen] = useState(false)

  // Local storage for favorites & pinned skills to match Inventory features
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skills_favorites') || '[]')
    } catch {
      return []
    }
  })
  const [pinned, setPinned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skills_pinned') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('skills_favorites', JSON.stringify(favorites))
    } catch {}
  }, [favorites])

  useEffect(() => {
    try {
      localStorage.setItem('skills_pinned', JSON.stringify(pinned))
    } catch {}
  }, [pinned])

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function togglePin(id) {
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  // Filters state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [quick, setQuick] = useState(null) // null | 'favorite' | 'pinned'
  const [sort, setSort] = useState('default')
  const [tagsExpanded, setTagsExpanded] = useState(false)

  const searchInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const skillsRaw = skillsQuery.data ?? []

  // Extract unique categories & tags
  const categories = useMemo(() => {
    const set = new Set()
    skillsRaw.forEach((s) => {
      if (s.category?.trim()) set.add(s.category.trim())
    })
    return [...set].sort((a, b) => a.localeCompare(b, 'th'))
  }, [skillsRaw])

  const allTags = useMemo(() => {
    const set = new Set()
    skillsRaw.forEach((s) => {
      (s.tags ?? []).forEach((t) => set.add(t))
    })
    return [...set].sort((a, b) => a.localeCompare(b, 'th'))
  }, [skillsRaw])

  // Decorated skills with favorite & pinned flags
  const skillsWithMeta = useMemo(() => {
    return skillsRaw.map((s) => ({
      ...s,
      is_favorite: favorites.includes(s.id),
      is_pinned: pinned.includes(s.id),
    }))
  }, [skillsRaw, favorites, pinned])

  // Filtered skills
  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()

    let result = skillsWithMeta.filter((s) => {
      if (category && s.category !== category) return false
      if (quick === 'favorite' && !s.is_favorite) return false
      if (quick === 'pinned' && !s.is_pinned) return false
      if (activeTags.length > 0) {
        const sTags = s.tags ?? []
        const hasAll = activeTags.every((t) => sTags.includes(t))
        if (!hasAll) return false
      }
      if (q) {
        const haystack = [s.title, s.content, s.category, ...(s.tags ?? [])].filter(Boolean).join(' ').toLowerCase()
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
    } else {
      // default: pinned first, then updated_desc
      result = [...result].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(b.updated_at) - new Date(a.updated_at)
      })
    }

    return result
  }, [skillsWithMeta, search, category, activeTags, quick, sort])

  const hasActiveFilters = search.trim() !== '' || category !== '' || activeTags.length > 0 || quick !== null

  function clearAllFilters() {
    setSearch('')
    setCategory('')
    setActiveTags([])
    setQuick(null)
    setSort('default')
  }

  function handleToggleTag(tag) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(skill) {
    setEditing(skill)
    setFormOpen(true)
  }

  async function handleSubmit(fields) {
    if (editing) {
      await updateSkill.mutateAsync({ id: editing.id, fields })
      showToast('บันทึกการแก้ไขแล้ว')
    } else {
      await createSkill.mutateAsync(fields)
      showToast('เพิ่มสกิลแล้ว')
    }
  }

  async function handleCopy(skill) {
    try {
      await navigator.clipboard.writeText(skill.content)
      showToast('คัดลอกสกิลแล้ว')
    } catch {
      showToast('คัดลอกไม่สำเร็จ')
    }
  }

  async function handleConfirmDelete() {
    await deleteSkill.mutateAsync(deleteTarget.id)
    showToast('ลบสกิลแล้ว')
    setDeleteTarget(null)
  }

  async function handleExport() {
    const json = await exportSkillsAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skills-library-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('ส่งออกไฟล์สกิลแล้ว')
  }

  async function handleImportFile(file) {
    try {
      const text = await file.text()
      const imported = await importSkills.mutateAsync(text)
      showToast(`นำเข้า ${imported.length} สกิลแล้ว`)
    } catch (err) {
      showToast(err.message ?? 'นำเข้าไฟล์ไม่สำเร็จ')
    }
  }

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT)
  const hiddenTagCount = allTags.length - visibleTags.length

  const favoriteCount = skillsWithMeta.filter((s) => s.is_favorite).length
  const pinnedCount = skillsWithMeta.filter((s) => s.is_pinned).length

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportFile(file)
          e.target.value = ''
        }}
      />

      {/* Toolbar — Matching Inventory / Library Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow font-mono">SKILLS CATALOG NO. 002</span>
          <p className="text-sm text-[var(--ink-soft)] mt-2">{skillsRaw.length} สกิลในคลัง</p>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex gap-2">
          <button className="btn btn-sm" onClick={handleExport}>
            <Download size={14} strokeWidth={1.8} /> ส่งออก
          </button>
          <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()} disabled={importSkills.isPending}>
            <Upload size={14} strokeWidth={1.8} /> นำเข้า
          </button>
          <button className="btn btn-sm btn-solid" onClick={openAdd}>
            <Plus size={14} strokeWidth={2} /> เพิ่มสกิล
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden gap-2 w-full">
          <button className="btn btn-sm btn-solid flex-1" onClick={openAdd}>
            <Plus size={14} strokeWidth={2} /> เพิ่มสกิล
          </button>
          <button className="btn-icon" title="เพิ่มเติม" onClick={() => setToolbarSheetOpen(true)}>
            <MoreHorizontal size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Scope Segmented Control & Filter Console (Redesigned to match Inventory) */}
      {skillsRaw.length > 0 && (
        <div className="filter-bar mb-1">
          {/* Primary Scope Tabs: ทั้งหมด / รายการโปรด / ปักหมุด */}
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[var(--glass-line)]">
            <button
              onClick={() => setQuick(null)}
              className={`chip-filter !font-medium ${quick === null ? 'chip-filter-active' : ''}`}
            >
              ทั้งหมด
              <span className="ml-1.5 font-mono text-[11px] opacity-80">({skillsRaw.length})</span>
            </button>
            <button
              onClick={() => setQuick(quick === 'favorite' ? null : 'favorite')}
              className={`chip-filter !font-medium ${quick === 'favorite' ? 'chip-filter-active' : ''}`}
            >
              <Star size={13} strokeWidth={2} fill={quick === 'favorite' ? 'currentColor' : 'none'} className="mr-1.5" />
              รายการโปรด
              <span className="ml-1.5 font-mono text-[11px] opacity-80">({favoriteCount})</span>
            </button>
            <button
              onClick={() => setQuick(quick === 'pinned' ? null : 'pinned')}
              className={`chip-filter !font-medium ${quick === 'pinned' ? 'chip-filter-active' : ''}`}
            >
              <Pin size={13} strokeWidth={2} fill={quick === 'pinned' ? 'currentColor' : 'none'} className="mr-1.5" />
              ปักหมุด
              <span className="ml-1.5 font-mono text-[11px] opacity-80">({pinnedCount})</span>
            </button>
          </div>

          {/* Search + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                className="field w-full pl-9 pr-9"
                placeholder="ค้นหาสกิล (ชื่อ, เนื้อหา, หมวดหมู่, แท็ก)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={14}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] pointer-events-none"
              />
              {search ? (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  onClick={() => setSearch('')}
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] border border-[var(--glass-line)] rounded px-1.5 py-0.5 pointer-events-none font-mono">
                  /
                </kbd>
              )}
            </div>

            {/* Dimensional dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="dropdown-select">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">หมวดหมู่ทั้งหมด</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} strokeWidth={2} className="dropdown-caret" />
              </div>

              <div className="dropdown-select">
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">ค่าเริ่มต้น (ปักหมุดก่อน)</option>
                  <option value="updated_desc">แก้ไขล่าสุด</option>
                  <option value="updated_asc">แก้ไขนานสุด</option>
                  <option value="title_asc">ชื่อ ก–ฮ</option>
                </select>
                <ChevronDown size={14} strokeWidth={2} className="dropdown-caret" />
              </div>
            </div>
          </div>

          {/* Active Tags Chips */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mb-3">
              <span className="text-xs text-[var(--ink-soft)] mr-1">กรองด้วย:</span>
              {activeTags.map((t) => (
                <span key={t} className="chip-filter chip-filter-active chip-filter-sm">
                  #{t}
                  <X size={11} strokeWidth={2.5} className="ml-1 cursor-pointer" onClick={() => handleToggleTag(t)} />
                </span>
              ))}
            </div>
          )}

          {/* Tag Cloud Selector */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)] mr-0.5">
                <Tag size={11} strokeWidth={2} /> แท็ก:
              </span>
              {visibleTags
                .filter((t) => !activeTags.includes(t))
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToggleTag(t)}
                    className="chip-filter chip-filter-sm"
                  >
                    #{t}
                  </button>
                ))}
              {hiddenTagCount > 0 && (
                <button className="chip-filter chip-filter-sm" onClick={() => setTagsExpanded(true)}>
                  +{hiddenTagCount} เพิ่มเติม
                </button>
              )}
              {tagsExpanded && allTags.length > TAG_PREVIEW_COUNT && (
                <button className="chip-filter chip-filter-sm" onClick={() => setTagsExpanded(false)}>
                  ย่อกลับ
                </button>
              )}
            </div>
          )}

          {/* Active filters status & clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3 pt-2 text-xs">
              <span className="text-[var(--ink-soft)]">
                แสดง {filteredSkills.length} จากทั้งหมด {skillsRaw.length} สกิล
              </span>
              <button className="btn-text-clear font-medium" onClick={clearAllFilters}>
                ล้างตัวกรองทั้งหมด ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {skillsQuery.isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="idx-card animate-pulse">
              <div className="h-4 w-24 bg-black/10 rounded mb-3" />
              <div className="h-5 w-4/5 bg-black/10 rounded mb-2" />
              <div className="h-16 w-full bg-black/5 rounded mb-4" />
              <div className="h-8 w-full bg-black/10 rounded mt-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no skills exist at all */}
      {skillsQuery.isSuccess && skillsRaw.length === 0 && <EmptyState onAdd={openAdd} />}

      {/* Empty State when filtered results are 0 */}
      {skillsQuery.isSuccess && skillsRaw.length > 0 && filteredSkills.length === 0 && (
        <EmptyState filtered onClearFilters={clearAllFilters} />
      )}

      {/* Skills Card Grid — Matching PromptCard in every detail */}
      {filteredSkills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((s, i) => (
            <div
              key={s.id}
              className={`idx-card${s.is_pinned ? ' pinned' : ''}`}
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            >
              {/* Top row: Category tag + Desktop quick action icons (Preview, Pin, Star) */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                    title={s.category || 'สกิล'}
                  />
                  {s.category && (
                    <span className="text-[11px] text-[var(--ink-soft)] truncate font-medium">{s.category}</span>
                  )}
                  {(s.tags ?? []).slice(0, 2).map((t) => (
                    <span key={t} className="tag !my-0">
                      #{t}
                    </span>
                  ))}
                  {(s.tags ?? []).length > 2 && (
                    <span className="text-[10.5px] text-[var(--ink-soft)]">+{(s.tags ?? []).length - 2}</span>
                  )}
                </div>

                {/* Desktop icon buttons */}
                <div className="hidden sm:flex gap-1 shrink-0">
                  <button title="ดูตัวอย่าง" className="btn-icon" onClick={() => setPreviewSkill(s)}>
                    <Eye size={13} strokeWidth={1.8} />
                  </button>
                  <button
                    title={s.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด'}
                    className={`btn-icon${s.is_pinned ? ' active' : ''}`}
                    onClick={() => togglePin(s.id)}
                  >
                    <Pin size={13} strokeWidth={1.8} fill={s.is_pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    title={s.is_favorite ? 'เลิกรายการโปรด' : 'เพิ่มรายการโปรด'}
                    className={`btn-icon${s.is_favorite ? ' active-stamp' : ''}`}
                    onClick={() => toggleFavorite(s.id)}
                  >
                    <Star size={13} strokeWidth={1.8} fill={s.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Title — clickable to preview */}
              <p className="card-title cursor-pointer" onClick={() => setPreviewSkill(s)}>
                {s.title}
              </p>

              {/* Snippet */}
              <p className="card-snip">{s.content}</p>

              {/* Meta footer: Last updated */}
              <div className="card-meta">
                <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                  {s.category ? `หมวด ${s.category}` : 'สกิลทั่วไป'}
                </span>
                <span>แก้ไข {formatRelative(s.updated_at)}</span>
              </div>

              {/* Desktop action row: คัดลอก + แก้ไข + ลบ */}
              <div className="hidden sm:flex gap-2 mt-3">
                <button className="btn btn-sm btn-teal flex-1" onClick={() => handleCopy(s)}>
                  <Copy size={13} strokeWidth={1.8} /> คัดลอก
                </button>
                <button className="btn btn-sm flex-1" onClick={() => openEdit(s)}>
                  <Pencil size={13} strokeWidth={1.8} /> แก้ไข
                </button>
                <button className="btn-icon" title="ลบ" onClick={() => setDeleteTarget(s)}>
                  <Trash2 size={13} strokeWidth={1.8} />
                </button>
              </div>

              {/* Mobile action row: คัดลอก + More action sheet */}
              <div className="flex sm:hidden gap-2 mt-3">
                <button className="btn btn-sm btn-teal flex-1" onClick={() => handleCopy(s)}>
                  <Copy size={13} strokeWidth={1.8} /> คัดลอก
                </button>
                <button className="btn-icon" title="เพิ่มเติม" onClick={() => setSheetSkill(s)}>
                  <MoreHorizontal size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile action sheet for a single skill */}
      {sheetSkill && (
        <ActionSheet
          open={Boolean(sheetSkill)}
          onClose={() => setSheetSkill(null)}
          title={sheetSkill.title}
          actions={[
            {
              label: 'ดูตัวอย่าง',
              icon: Eye,
              onClick: () => {
                setPreviewSkill(sheetSkill)
                setSheetSkill(null)
              },
            },
            {
              label: sheetSkill.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด',
              icon: Pin,
              onClick: () => {
                togglePin(sheetSkill.id)
                setSheetSkill(null)
              },
            },
            {
              label: sheetSkill.is_favorite ? 'เลิกรายการโปรด' : 'เพิ่มรายการโปรด',
              icon: Star,
              onClick: () => {
                toggleFavorite(sheetSkill.id)
                setSheetSkill(null)
              },
            },
            {
              label: 'แก้ไข',
              icon: Pencil,
              onClick: () => {
                openEdit(sheetSkill)
                setSheetSkill(null)
              },
            },
            {
              label: 'ลบ',
              icon: Trash2,
              destructive: true,
              onClick: () => {
                setDeleteTarget(sheetSkill)
                setSheetSkill(null)
              },
            },
          ]}
        />
      )}

      {/* Toolbar overflow sheet for Mobile */}
      <ActionSheet
        open={toolbarSheetOpen}
        onClose={() => setToolbarSheetOpen(false)}
        actions={[
          { label: 'ส่งออก JSON', icon: Download, onClick: handleExport },
          { label: 'นำเข้า JSON', icon: Upload, onClick: () => fileInputRef.current?.click() },
        ]}
      />

      {/* Preview Modal */}
      <SkillPreviewModal
        skill={previewSkill}
        onClose={() => setPreviewSkill(null)}
        onCopy={handleCopy}
        onEdit={(s) => {
          setPreviewSkill(null)
          openEdit(s)
        }}
      />

      {/* Add / Edit Form Modal */}
      <SkillFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        saving={createSkill.isPending || updateSkill.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ลบสกิลนี้?"
        description={deleteTarget ? `"${deleteTarget.title}" จะถูกลบทันที` : ''}
        confirmLabel="ลบ"
        danger
        busy={deleteSkill.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
