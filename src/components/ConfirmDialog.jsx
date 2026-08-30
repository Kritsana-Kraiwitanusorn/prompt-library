export default function ConfirmDialog({ open, title, description, confirmLabel = 'ยืนยัน', danger, onConfirm, onCancel, busy }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal-sm">
        <h2 className="font-display text-lg font-semibold mb-2">{title}</h2>
        {description && <p className="text-sm text-[var(--ink-soft)] mb-6">{description}</p>}
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className={`btn ${danger ? 'btn-stamp' : 'btn-solid'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'กำลังดำเนินการ…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
