import { useState } from 'react'
import { Eye, Pin, Star, Pencil, Trash2, MoreHorizontal, History } from 'lucide-react'
import { getStatusMeta } from '../lib/constants'
import { extractVariables } from '../lib/variables'
import ActionSheet from './ActionSheet'

const STATUS_DOT_COLOR = {
  draft: 'var(--ink-soft)',
  review: 'var(--mustard)',
  production: 'var(--teal)',
  archived: 'var(--ink-soft)',
}

function formatRelative(dateStr) {
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

export default function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
  onTogglePin,
  onViewHistory,
  onPreview,
  disabled,
  style,
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const isOptimistic = Boolean(prompt._optimistic)
  const actionsDisabled = disabled
  const status = getStatusMeta(prompt.status)
  const visibleTags = (prompt.tags ?? []).slice(0, 2)
  const extraTagCount = (prompt.tags ?? []).length - visibleTags.length
  const variableCount = extractVariables(prompt.content).length

  const sheetActions = [
    { label: 'ดูตัวอย่าง', icon: Eye, onClick: () => onPreview(prompt) },
    { label: prompt.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด', icon: Pin, onClick: () => onTogglePin(prompt) },
    { label: prompt.is_favorite ? 'เลิกรายการโปรด' : 'เพิ่มรายการโปรด', icon: Star, onClick: () => onToggleFavorite(prompt) },
    { label: 'แก้ไข', icon: Pencil, onClick: () => onEdit(prompt) },
    { label: `ประวัติเวอร์ชัน (v${prompt.current_version})`, icon: History, onClick: () => onViewHistory(prompt) },
    { label: 'ลบ', icon: Trash2, destructive: true, onClick: () => onDelete(prompt) },
  ]

  return (
    <div className={`idx-card${prompt.is_pinned ? ' pinned' : ''}${isOptimistic ? ' optimistic' : ''}`} style={style}>
      {/* Compact meta row — status dot + category only, tags shown minimally */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: STATUS_DOT_COLOR[status.value] }}
            title={status.label}
          />
          {prompt.category && (
            <span className="text-[11px] text-[var(--ink-soft)] truncate">{prompt.category.name}</span>
          )}
          {visibleTags.map((t) => (
            <span key={t} className="tag !my-0">
              #{t}
            </span>
          ))}
          {extraTagCount > 0 && <span className="text-[10.5px] text-[var(--ink-soft)]">+{extraTagCount}</span>}
          {variableCount > 0 && (
            <span className="var-chip" title={`มีตัวแปร ${variableCount} ตัว`}>
              {`{{${variableCount}}}`}
            </span>
          )}
        </div>

        {/* Desktop-only quick actions */}
        <div className="hidden sm:flex gap-1 shrink-0">
          <button title="ดูตัวอย่าง" className="btn-icon" onClick={() => onPreview(prompt)}>
            <Eye size={14} strokeWidth={1.8} />
          </button>
          <button
            title={prompt.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด'}
            className={`btn-icon${prompt.is_pinned ? ' active' : ''}`}
            onClick={() => onTogglePin(prompt)}
            disabled={actionsDisabled}
          >
            <Pin size={14} strokeWidth={1.8} fill={prompt.is_pinned ? 'currentColor' : 'none'} />
          </button>
          <button
            title={prompt.is_favorite ? 'เลิกรายการโปรด' : 'เพิ่มรายการโปรด'}
            className={`btn-icon${prompt.is_favorite ? ' active-stamp' : ''}`}
            onClick={() => onToggleFavorite(prompt)}
            disabled={actionsDisabled}
          >
            <Star size={14} strokeWidth={1.8} fill={prompt.is_favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {prompt.image_url && (
        <img
          src={prompt.image_url}
          alt=""
          className="card-image"
          loading="lazy"
          onClick={() => onPreview(prompt)}
        />
      )}
      <p className="card-title cursor-pointer" onClick={() => onPreview(prompt)}>
        {prompt.title}
      </p>
      <p className="card-snip">{prompt.content}</p>

      <div className="card-meta">
        <button
          className="font-mono underline decoration-dashed underline-offset-2 hover:text-[var(--ink)] disabled:no-underline disabled:cursor-default hidden sm:inline"
          onClick={() => onViewHistory(prompt)}
          title="ดูประวัติเวอร์ชัน"
          disabled={isOptimistic}
        >
          v{prompt.current_version}
        </button>
        <span className="sm:hidden font-mono">v{prompt.current_version}</span>
        <span>{isOptimistic ? 'กำลังบันทึก…' : `แก้ไข ${formatRelative(prompt.updated_at)}`}</span>
      </div>

      {/* Desktop action row */}
      <div className="hidden sm:flex gap-2 mt-3">
        <button className="btn btn-sm btn-teal flex-1" onClick={() => onCopy(prompt)}>
          คัดลอก
        </button>
        <button className="btn btn-sm flex-1" onClick={() => onEdit(prompt)} disabled={actionsDisabled}>
          แก้ไข
        </button>
        <button className="btn-icon" title="ลบ" onClick={() => onDelete(prompt)} disabled={actionsDisabled}>
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile: one primary action + overflow menu instead of a row of icons */}
      <div className="flex sm:hidden gap-2 mt-3">
        <button className="btn btn-sm btn-teal flex-1" onClick={() => onCopy(prompt)}>
          คัดลอก
        </button>
        <button className="btn-icon" title="เพิ่มเติม" onClick={() => setSheetOpen(true)} disabled={actionsDisabled}>
          <MoreHorizontal size={16} strokeWidth={1.8} />
        </button>
      </div>

      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={prompt.title}
        actions={sheetActions}
      />
    </div>
  )
}
