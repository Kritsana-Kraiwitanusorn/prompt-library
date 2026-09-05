import { useState } from 'react'
import { useDeletedPromptsQuery, useRestorePrompt, useHardDeletePrompt } from '../hooks/usePrompts'
import ConfirmDialog from './ConfirmDialog'

export default function TrashView({ showToast }) {
  const deletedQuery = useDeletedPromptsQuery()
  const restorePrompt = useRestorePrompt()
  const hardDeletePrompt = useHardDeletePrompt()
  const deleted = deletedQuery.data ?? []
  const [confirmTarget, setConfirmTarget] = useState(null)

  async function handleRestore(prompt) {
    await restorePrompt.mutateAsync(prompt)
    showToast(`กู้คืน "${prompt.title}" แล้ว`)
  }

  async function handleConfirmHardDelete() {
    const target = confirmTarget
    await hardDeletePrompt.mutateAsync(target)
    showToast(`ลบ "${target.title}" ถาวรแล้ว`)
    setConfirmTarget(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="eyebrow font-mono">TRASH</span>
        <h2 className="font-display text-2xl font-medium mt-3">ถังขยะ</h2>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          พรอมต์ที่ลบจะอยู่ที่นี่ กู้คืนได้ตลอดเวลา หรือลบถาวรถ้าไม่ต้องการเก็บไว้แล้ว
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
              <div className="flex gap-2 shrink-0">
                <button className="btn btn-sm" onClick={() => handleRestore(p)} disabled={restorePrompt.isPending}>
                  กู้คืน
                </button>
                <button
                  className="btn btn-sm btn-stamp"
                  onClick={() => setConfirmTarget(p)}
                  disabled={hardDeletePrompt.isPending}
                >
                  ลบถาวร
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="ลบถาวร?"
        description={confirmTarget ? `"${confirmTarget.title}" จะถูกลบทิ้งจริง กู้คืนไม่ได้อีก รวมถึงประวัติเวอร์ชันและรูปภาพที่แนบไว้` : ''}
        confirmLabel="ลบถาวร"
        danger
        busy={hardDeletePrompt.isPending}
        onConfirm={handleConfirmHardDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
