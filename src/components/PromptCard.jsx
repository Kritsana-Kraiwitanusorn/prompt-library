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
  disabled,
  style,
}) {
  const isOptimistic = Boolean(prompt._optimistic)
  const actionsDisabled = disabled

  return (
    <div className={`idx-card${prompt.is_pinned ? ' pinned' : ''}${isOptimistic ? ' optimistic' : ''}`} style={style}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap">
          {prompt.category && <span className="tag tag-cat">{prompt.category.name}</span>}
          {prompt.tags?.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            title={prompt.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด'}
            className={`btn-icon${prompt.is_pinned ? ' active' : ''}`}
            onClick={() => onTogglePin(prompt)}
            disabled={actionsDisabled}
          >
            📌
          </button>
          <button
            title={prompt.is_favorite ? 'เลิกรายการโปรด' : 'เพิ่มรายการโปรด'}
            className={`btn-icon${prompt.is_favorite ? ' active-stamp' : ''}`}
            onClick={() => onToggleFavorite(prompt)}
            disabled={actionsDisabled}
          >
            {prompt.is_favorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      {prompt.image_url && <img src={prompt.image_url} alt="" className="card-image" loading="lazy" />}
      <p className="card-title">{prompt.title}</p>
      <p className="card-snip">{prompt.content}</p>

      <div className="card-meta">
        <button
          className="font-mono underline decoration-dashed underline-offset-2 hover:text-[var(--ink)] disabled:no-underline disabled:cursor-default"
          onClick={() => onViewHistory(prompt)}
          title="ดูประวัติเวอร์ชัน"
          disabled={isOptimistic}
        >
          v{prompt.current_version}
        </button>
        <span>{isOptimistic ? 'กำลังบันทึก…' : `แก้ไข ${formatRelative(prompt.updated_at)}`}</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button className="btn btn-sm btn-teal flex-1" onClick={() => onCopy(prompt)}>
          คัดลอก
        </button>
        <button className="btn btn-sm flex-1" onClick={() => onEdit(prompt)} disabled={actionsDisabled}>
          แก้ไข
        </button>
        <button className="btn-icon" title="ลบ" onClick={() => onDelete(prompt)} disabled={actionsDisabled}>
          🗑
        </button>
      </div>
    </div>
  )
}
