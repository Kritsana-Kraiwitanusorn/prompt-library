import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { SORT_OPTIONS } from '../hooks/useFilteredPrompts'
import { STATUS_OPTIONS } from '../lib/constants'

const TAG_PREVIEW_COUNT = 8

export default function FilterBar({
  search,
  onSearchChange,
  searchInputRef,
  categories,
  categoryId,
  onCategoryChange,
  allTags,
  activeTags,
  onToggleTag,
  quick,
  onQuickChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}) {
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT)
  const hiddenTagCount = allTags.length - visibleTags.length

  return (
    <div className="filter-bar mb-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            className="field w-full pr-9"
            placeholder="ค้นหาพรอมต์…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {!search && (
            <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] border border-[var(--glass-line)] rounded px-1.5 py-0.5 pointer-events-none">
              /
            </kbd>
          )}
        </div>
        <div className="sort-control">
          <span className="text-xs text-[var(--ink-soft)]">เรียงตาม</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <FilterChip active={quick === null} onClick={() => onQuickChange(null)} label="ทั้งหมด" />
        <FilterChip
          active={quick === 'favorite'}
          onClick={() => onQuickChange(quick === 'favorite' ? null : 'favorite')}
          label="★ รายการโปรด"
        />
        <FilterChip
          active={quick === 'pinned'}
          onClick={() => onQuickChange(quick === 'pinned' ? null : 'pinned')}
          label="📌 ปักหมุด"
        />
      </div>

      {/* Category + status as compact dropdowns instead of a wall of chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="dropdown-select">
          <select value={categoryId ?? ''} onChange={(e) => onCategoryChange(e.target.value || null)}>
            <option value="">หมวดหมู่ทั้งหมด</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={2} className="dropdown-caret" />
        </div>

        <div className="dropdown-select">
          <select value={status ?? ''} onChange={(e) => onStatusChange(e.target.value || null)}>
            <option value="">สถานะทั้งหมด</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={2} className="dropdown-caret" />
        </div>

        {activeTags.map((t) => (
          <span key={t} className="chip-filter chip-filter-active chip-filter-sm">
            #{t}
            <X size={11} strokeWidth={2.5} className="ml-1 cursor-pointer" onClick={() => onToggleTag(t)} />
          </span>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[var(--ink-soft)] mr-1">แท็ก:</span>
          {visibleTags
            .filter((t) => !activeTags.includes(t))
            .map((t) => (
              <FilterChip key={t} active={false} onClick={() => onToggleTag(t)} label={`#${t}`} small />
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

      {hasActiveFilters && (
        <button className="btn-text-clear mt-3" onClick={onClearAll}>
          ล้างตัวกรองทั้งหมด ✕
        </button>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, small }) {
  return (
    <button
      onClick={onClick}
      className={`chip-filter${active ? ' chip-filter-active' : ''}${small ? ' chip-filter-sm' : ''}`}
    >
      {label}
    </button>
  )
}
