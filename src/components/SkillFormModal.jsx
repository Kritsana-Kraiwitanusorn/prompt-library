import { useEffect, useState } from 'react'

const emptyForm = { title: '', category: '', content: '', tags: '' }
const CATEGORY_SUGGESTIONS = ['UX/UI', 'Analysis', 'Coding', 'Writing', 'Research', 'Marketing']

export default function SkillFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title ?? '',
        category: initial.category ?? '',
        content: initial.content ?? '',
        tags: (initial.tags ?? []).join(', '),
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [open, initial])

  if (!open) return null

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('กรุณากรอกชื่อและเนื้อหา')
      return
    }
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await onSubmit({
        title: form.title.trim(),
        category: form.category.trim(),
        content: form.content.trim(),
        tags,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="font-display text-xl font-semibold mb-4">{initial ? 'แก้ไขสกิล' : 'เพิ่มสกิลใหม่'}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">ชื่อสกิล</label>
              <input
                className="field"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="เช่น หลักการ UX/UI เบื้องต้น"
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">หมวด</label>
              <input
                className="field"
                list="skill-category-suggestions"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="เช่น UX/UI, Analysis"
              />
              <datalist id="skill-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="field-label">เนื้อหา</label>
            <textarea
              className="field font-mono text-[13px]"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="เขียนเนื้อหาสกิลที่นี่..."
              rows={8}
            />
          </div>

          <div>
            <label className="field-label">แท็ก (คั่นด้วยจุลภาค)</label>
            <input
              className="field"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="checklist, heuristics"
            />
          </div>

          {error && <p className="text-sm text-[var(--stamp)]">{error}</p>}

          <div className="flex gap-2.5 mt-2">
            <button type="button" className="btn flex-1" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-solid flex-1" disabled={saving}>
              {saving ? 'กำลังบันทึก…' : initial ? 'บันทึกการแก้ไข' : 'เพิ่มสกิล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
