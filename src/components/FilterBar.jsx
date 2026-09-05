import { useState } from 'react'
import { SORT_OPTIONS } from '../hooks/useFilteredPrompts'
import { STATUS_OPTIONS } from '../lib/constants'

const TAG_PREVIEW_COUNT = 10

export default function FilterBar({
  search,
  onSearchChange,
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
  const [showAllTags, setShowAllTags] = useState(false)
  const visibleTags = showAllTags ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT)
  const hiddenTagCount = allTags.length - visibleTags.length

  return (
    <div className="filter-bar">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          className="field flex-1"
          placeholder="ค้นหาพรอมต์…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <label className="sort-control">
          <span>เรียง:</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-2.5">
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

        {categories?.length > 0 && (
          <span className="hidden sm:inline-block self-stretch w-px bg-[var(--paper-edge)] mx-1" />
        )}
        {categories?.map((c) => (
          <FilterChip
            key={c.id}
            active={categoryId === c.id}
            onClick={() => onCategoryChange(categoryId === c.id ? null : c.id)}
            label={
              <>
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </>
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-2.5">
        <span className="text-xs text-[var(--ink-soft)] mr-0.5">สถานะ:</span>
        {STATUS_OPTIONS.map((s) => (
          <FilterChip
            key={s.value}
            active={status === s.value}
            onClick={() => onStatusChange(status === s.value ? null : s.value)}
            label={s.label}
            small
          />
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[var(--ink-soft)] mr-0.5">แท็ก:</span>
          {visibleTags.map((t) => (
            <FilterChip
              key={t}
              active={activeTags.includes(t)}
              onClick={() => onToggleTag(t)}
              label={`#${t}`}
              small
            />
          ))}
          {hiddenTagCount > 0 && (
            <button className="btn-text-clear !text-[var(--ink-soft)] !no-underline" onClick={() => setShowAllTags(true)}>
              +{hiddenTagCount} เพิ่มเติม
            </button>
          )}
          {showAllTags && allTags.length > TAG_PREVIEW_COUNT && (
            <button className="btn-text-clear !text-[var(--ink-soft)] !no-underline" onClick={() => setShowAllTags(false)}>
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
