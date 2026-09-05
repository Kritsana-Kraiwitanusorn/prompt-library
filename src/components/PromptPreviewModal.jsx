import { getStatusMeta } from '../lib/constants'

export default function PromptPreviewModal({ prompt, onClose, onCopy, onEdit }) {
  if (!prompt) return null
  const status = getStatusMeta(prompt.status)

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="font-display text-xl font-semibold">{prompt.title}</h2>
          <span className={`status-badge ${status.badgeClass} shrink-0 mt-1`}>{status.label}</span>
        </div>

        <div className="flex flex-wrap mb-4">
          {prompt.category && <span className="tag tag-cat">{prompt.category.name}</span>}
          {prompt.tags?.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>

        {prompt.image_url && (
          <img src={prompt.image_url} alt="" className="w-full max-h-72 object-contain rounded-md border border-[var(--paper-edge)] bg-[var(--canvas)] mb-4" />
        )}

        <div className="field !bg-[var(--canvas)] font-mono text-[13px] whitespace-pre-wrap max-h-64 overflow-y-auto mb-2">
          {prompt.content}
        </div>

        <p className="text-xs text-[var(--ink-soft)] mb-5">
          v{prompt.current_version} · แก้ไขล่าสุด {new Date(prompt.updated_at).toLocaleString('th-TH')}
        </p>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            ปิด
          </button>
          <button className="btn" onClick={() => onEdit(prompt)}>
            แก้ไข
          </button>
          <button className="btn btn-teal" onClick={() => onCopy(prompt)}>
            คัดลอก
          </button>
        </div>
      </div>
    </div>
  )
}
