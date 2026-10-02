import { useState } from 'react'
import { ChevronDown, X, Star, Pin, Tag, Search } from 'lucide-react'
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
  totalCount = 0,
  favoritesCount = 0,
  pinnedCount = 0,
  filteredCount = 0,
}) {
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT)
  const hiddenTagCount = allTags.length - visibleTags.length

  return (
    <div className="filter-bar mb-4 sm:mb-6">
      {/* Scope Segmented Bar: ทั้งหมด | ★ รายการโปรด | 📌 ปักหมุด */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 pb-2.5 border-b border-[var(--glass-line)] overflow-x-auto no-scrollbar flex-nowrap">
        <button
          onClick={() => onQuickChange(null)}
          className={`chip-filter !font-medium shrink-0 ${quick === null ? 'chip-filter-active' : ''}`}
        >
          ทั้งหมด
          {totalCount > 0 && <span className="ml-1.5 font-mono text-[11px] opacity-80">({totalCount})</span>}
        </button>

        <button
          onClick={() => onQuickChange(quick === 'favorite' ? null : 'favorite')}
          className={`chip-filter !font-medium shrink-0 ${quick === 'favorite' ? 'chip-filter-active' : ''}`}
        >
          <Star
            size={13}
            strokeWidth={2}
            fill={quick === 'favorite' ? 'currentColor' : 'none'}
            className="mr-1.5"
          />
          รายการโปรด
          {favoritesCount > 0 && (
            <span className="ml-1.5 font-mono text-[11px] opacity-80">({favoritesCount})</span>
          )}
        </button>

        <button
          onClick={() => onQuickChange(quick === 'pinned' ? null : 'pinned')}
          className={`chip-filter !font-medium shrink-0 ${quick === 'pinned' ? 'chip-filter-active' : ''}`}
        >
          <Pin
            size={13}
            strokeWidth={2}
            fill={quick === 'pinned' ? 'currentColor' : 'none'}
            className="mr-1.5"
          />
          ปักหมุด
          {pinnedCount > 0 && (
            <span className="ml-1.5 font-mono text-[11px] opacity-80">({pinnedCount})</span>
          )}
        </button>
      </div>

      {/* Search Input & Dropdown Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-2.5">
        {/* Search Field with field-search to prevent text and icon overlapping */}
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            className="field field-search w-full"
            placeholder="ค้นหาพรอมต์ (ชื่อ, เนื้อหา, หมวดหมู่, แท็ก)…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search
            size={16}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] pointer-events-none"
          />
          {search ? (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              onClick={() => onSearchChange('')}
              title="ล้างข้อความค้นหา"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] border border-[var(--glass-line)] rounded px-1.5 py-0.5 pointer-events-none font-mono">
              /
            </kbd>
          )}
        </div>

        {/* Dimensional Filters: horizontally scrollable on mobile so they never break into 3 rows */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
          {/* All Categories */}
          <div className="dropdown-select shrink-0">
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

          {/* All Statuses */}
          <div className="dropdown-select shrink-0">
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

          {/* Sort Options */}
          <div className="dropdown-select shrink-0">
            <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={2} className="dropdown-caret" />
          </div>
        </div>
      </div>

      {/* Active Tags Indicator */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center mb-2.5">
          <span className="text-xs text-[var(--ink-soft)] mr-1">กรองด้วยแท็ก:</span>
          {activeTags.map((t) => (
            <span key={t} className="chip-filter chip-filter-active chip-filter-sm">
              #{t}
              <X size={11} strokeWidth={2.5} className="ml-1 cursor-pointer" onClick={() => onToggleTag(t)} />
            </span>
          ))}
        </div>
      )}

      {/* Tag Browser Ribbon (horizontally scrollable on mobile) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 flex-nowrap sm:flex-wrap">
          <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)] mr-0.5 shrink-0">
            <Tag size={11} strokeWidth={2} /> แท็ก:
          </span>
          {visibleTags
            .filter((t) => !activeTags.includes(t))
            .map((t) => (
              <button
                key={t}
                onClick={() => onToggleTag(t)}
                className="chip-filter chip-filter-sm shrink-0"
              >
                #{t}
              </button>
            ))}
          {hiddenTagCount > 0 && (
            <button className="chip-filter chip-filter-sm shrink-0" onClick={() => setTagsExpanded(true)}>
              +{hiddenTagCount} เพิ่มเติม
            </button>
          )}
          {tagsExpanded && allTags.length > TAG_PREVIEW_COUNT && (
            <button className="chip-filter chip-filter-sm shrink-0" onClick={() => setTagsExpanded(false)}>
              ย่อกลับ
            </button>
          )}
        </div>
      )}

      {/* Active Filters Summary & Clear Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mt-2.5 pt-2 text-xs">
          <span className="text-[var(--ink-soft)] truncate">
            แสดง {filteredCount} จากทั้งหมด {totalCount} พรอมต์
          </span>
          <button className="btn-text-clear font-medium shrink-0 ml-2" onClick={onClearAll}>
            ล้างตัวกรองทั้งหมด ✕
          </button>
        </div>
      )}
    </div>
  )
}
