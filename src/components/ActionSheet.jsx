export default function ActionSheet({ open, onClose, title, actions = [] }) {
  if (!open) return null

  function handleAction(action) {
    onClose()
    action.onClick()
  }

  return (
    <div className="action-sheet-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="action-sheet">
        <div className="action-sheet-group">
          {title && (
            <div className="px-4 py-3 text-center text-xs text-[var(--ink-soft)] border-b border-[var(--paper-edge)]">
              {title}
            </div>
          )}
          {actions.map((action) => (
            <button
              key={action.label}
              className={`action-sheet-item${action.destructive ? ' destructive' : ''}`}
              onClick={() => handleAction(action)}
            >
              {action.icon && <action.icon className="sheet-icon" strokeWidth={2} />}
              {action.label}
            </button>
          ))}
        </div>
        <button className="action-sheet-cancel" onClick={onClose}>
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
