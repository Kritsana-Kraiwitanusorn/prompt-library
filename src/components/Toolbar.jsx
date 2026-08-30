import { useRef } from 'react'

export default function Toolbar({ onAdd, onExport, onImportFile, promptCount, disabled }) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
      <div>
        <span className="eyebrow font-mono">CATALOG NO. 001</span>
        <p className="text-sm text-[var(--ink-soft)] mt-2">{promptCount} พรอมต์ในคลัง</p>
      </div>

      <div className="flex gap-2 flex-wrap w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
        <button className="btn btn-sm" onClick={onExport}>
          ⭳ ส่งออก
        </button>
        <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          ⭱ นำเข้า
        </button>
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
        <button className="btn btn-sm btn-solid" onClick={onAdd} disabled={disabled}>
          + เพิ่มพรอมต์
        </button>
      </div>
    </div>
  )
}
