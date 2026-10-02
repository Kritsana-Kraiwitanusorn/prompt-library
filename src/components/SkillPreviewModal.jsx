export default function SkillPreviewModal({ skill, onClose, onCopy, onEdit }) {
  if (!skill) return null

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-display text-xl font-semibold">{skill.title}</h2>
          {skill.category && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {skill.category}
            </span>
          )}
        </div>

        {skill.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags.map((t) => (
              <span key={t} className="tag !my-0">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="field !bg-[var(--canvas)] font-mono text-[13px] whitespace-pre-wrap max-h-72 overflow-y-auto mb-3">
          {skill.content}
        </div>

        {skill.updated_at && (
          <p className="text-xs text-[var(--ink-soft)] mb-5">
            แก้ไขล่าสุด {new Date(skill.updated_at).toLocaleString('th-TH')}
          </p>
        )}

        <div className="flex gap-2.5">
          <button className="btn flex-1" onClick={onClose}>
            ปิด
          </button>
          <button
            className="btn flex-1"
            onClick={() => {
              onClose()
              onEdit(skill)
            }}
          >
            แก้ไข
          </button>
          <button className="btn btn-teal flex-1" onClick={() => onCopy(skill)}>
            คัดลอก
          </button>
        </div>
      </div>
    </div>
  )
}
