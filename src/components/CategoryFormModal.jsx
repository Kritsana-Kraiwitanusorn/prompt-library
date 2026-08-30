import { useEffect, useState } from 'react'

const SWATCHES = [
  '#1F5C52', // teal (brand)
  '#C48A2A', // mustard (brand)
  '#A6402F', // stamp red (brand)
  '#3B5BA9', // slate blue
  '#6B5CA5', // plum
  '#5B7B4F', // sage
  '#B5654A', // clay
  '#64748B', // neutral gray
]

export default function CategoryFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setColor(initial?.color ?? SWATCHES[0])
    setError('')
  }, [open, initial])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('กรุณาตั้งชื่อหมวดหมู่')
      return
    }
    try {
      await onSubmit({ name: name.trim(), color })
      onClose()
    } catch (err) {
      setError(err.message ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <h2 className="font-display text-lg font-semibold mb-5">
          {initial ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label">ชื่อหมวดหมู่</label>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น การตลาด"
              autoFocus
            />
          </div>

          <div>
            <label className="field-label">สี</label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`swatch${color === c ? ' swatch-active' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[var(--stamp)]">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-solid" disabled={saving}>
              {saving ? 'กำลังบันทึก…' : initial ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
