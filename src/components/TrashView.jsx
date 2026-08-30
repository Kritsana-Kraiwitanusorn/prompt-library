import { useDeletedPromptsQuery, useRestorePrompt } from '../hooks/usePrompts'

export default function TrashView({ showToast }) {
  const deletedQuery = useDeletedPromptsQuery()
  const restorePrompt = useRestorePrompt()
  const deleted = deletedQuery.data ?? []

  async function handleRestore(prompt) {
    await restorePrompt.mutateAsync(prompt.id)
    showToast(`กู้คืน "${prompt.title}" แล้ว`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="eyebrow font-mono">TRASH</span>
        <h2 className="font-display text-2xl font-medium mt-3">ถังขยะ</h2>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          พรอมต์ที่ลบจะอยู่ที่นี่ กู้คืนได้ตลอดเวลา — ไม่มีการลบถาวรอัตโนมัติ
        </p>
      </div>

      {deletedQuery.isPending && <p className="text-sm text-[var(--ink-soft)]">กำลังโหลด…</p>}

      {deletedQuery.isSuccess && deleted.length === 0 && (
        <div className="settings-card settings-card-muted text-center py-10">
          <p className="text-2xl mb-2">🗑️</p>
          <p className="text-sm text-[var(--ink-soft)]">ถังขยะว่างเปล่า</p>
        </div>
      )}

      {deleted.length > 0 && (
        <ul className="category-list">
          {deleted.map((p) => (
            <li key={p.id} className="category-row items-start gap-3">
              {p.category && <span className="swatch-dot mt-1.5" style={{ backgroundColor: p.category.color }} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-[var(--ink-soft)] mt-0.5 line-clamp-1">{p.content}</p>
              </div>
              <button className="btn btn-sm shrink-0" onClick={() => handleRestore(p)} disabled={restorePrompt.isPending}>
                กู้คืน
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
