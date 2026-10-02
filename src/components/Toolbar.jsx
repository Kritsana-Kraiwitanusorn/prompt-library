import { useRef, useState } from 'react'
import { Download, Upload, Plus, MoreHorizontal } from 'lucide-react'
import ActionSheet from './ActionSheet'

export default function Toolbar({ onAdd, onExport, onImportFile, promptCount, disabled }) {
  const fileInputRef = useRef(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function triggerImport() {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
      {/* Desktop Heading */}
      <div className="hidden sm:block">
        <span className="eyebrow font-mono">CATALOG NO. 001</span>
        <p className="text-sm text-[var(--ink-soft)] mt-1.5">{promptCount} พรอมต์ในคลัง</p>
      </div>

      {/* Mobile Compact Heading */}
      <div className="flex sm:hidden items-center gap-2 min-w-0">
        <h1 className="font-display font-bold text-lg tracking-tight truncate">คลังพรอมต์</h1>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shrink-0">
          {promptCount}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImportFile(file)
          e.target.value = ''
        }}
      />

      {/* Desktop: all actions visible */}
      <div className="hidden sm:flex gap-2">
        <button className="btn btn-sm" onClick={onExport}>
          <Download size={14} strokeWidth={1.8} /> ส่งออก
        </button>
        <button className="btn btn-sm" onClick={triggerImport} disabled={disabled}>
          <Upload size={14} strokeWidth={1.8} /> นำเข้า
        </button>
        <button className="btn btn-sm btn-solid" onClick={onAdd} disabled={disabled}>
          <Plus size={14} strokeWidth={2} /> เพิ่มพรอมต์
        </button>
      </div>

      {/* Mobile: compact action button + overflow icon side-by-side on the same row */}
      <div className="flex sm:hidden items-center gap-1.5 shrink-0">
        <button className="btn btn-sm btn-solid !py-1.5 !px-3" onClick={onAdd} disabled={disabled}>
          <Plus size={14} strokeWidth={2.2} /> เพิ่มพรอมต์
        </button>
        <button className="btn-icon !w-8 !h-8" title="เพิ่มเติม" onClick={() => setSheetOpen(true)}>
          <MoreHorizontal size={15} strokeWidth={1.8} />
        </button>
      </div>

      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        actions={[
          { label: 'ส่งออก JSON', icon: Download, onClick: onExport },
          { label: 'นำเข้า JSON', icon: Upload, onClick: triggerImport },
        ]}
      />
    </div>
  )
}
