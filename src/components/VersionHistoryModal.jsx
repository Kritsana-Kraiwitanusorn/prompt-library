import { useVersionsQuery } from '../hooks/usePrompts'

export default function VersionHistoryModal({ prompt, onClose, onRestore, restoring }) {
  const open = Boolean(prompt)
  const { data: versions, isPending } = useVersionsQuery(prompt?.id, open)

  if (!open) return null

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="font-display text-xl font-semibold mb-1">ประวัติเวอร์ชัน</h2>
        <p className="text-sm text-[var(--ink-soft)] mb-5">{prompt.title}</p>

        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <div className="hairline pt-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
            <div>
              <p className="font-mono text-xs text-[var(--teal-deep)] mb-1">
                v{prompt.current_version} · เวอร์ชันปัจจุบัน
              </p>
              <p className="text-sm whitespace-pre-wrap break-words">{prompt.content}</p>
            </div>
          </div>

          {isPending && <p className="text-sm text-[var(--ink-soft)]">กำลังโหลด…</p>}
          {!isPending && versions?.length === 0 && (
            <p className="text-sm text-[var(--ink-soft)]">ยังไม่มีการแก้ไขก่อนหน้านี้</p>
          )}
          {versions?.map((v) => (
            <div key={v.id} className="hairline pt-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-[var(--ink-soft)] mb-1">
                  v{v.version} · {new Date(v.created_at).toLocaleString('th-TH')}
                </p>
                <p className="text-sm text-[var(--ink-soft)] whitespace-pre-wrap break-words line-clamp-3">{v.content}</p>
              </div>
              <button
                className="btn btn-sm shrink-0 self-start"
                onClick={() => onRestore(prompt.id, v.version)}
                disabled={restoring}
              >
                กู้คืน
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button className="btn w-full sm:w-auto" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
