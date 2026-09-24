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
    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
      <div>
        <span className="eyebrow font-mono">CATALOG NO. 001</span>
        <p className="text-sm text-[var(--ink-soft)] mt-2">{promptCount} พรอมต์ในคลัง</p>
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

      {/* Mobile: one primary action + overflow menu, to keep the toolbar from feeling crowded */}
      <div className="flex sm:hidden gap-2 w-full">
        <button className="btn btn-sm btn-solid flex-1" onClick={onAdd} disabled={disabled}>
          <Plus size={14} strokeWidth={2} /> เพิ่มพรอมต์
        </button>
        <button className="btn-icon" title="เพิ่มเติม" onClick={() => setSheetOpen(true)}>
          <MoreHorizontal size={16} strokeWidth={1.8} />
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
