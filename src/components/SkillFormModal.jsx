import { useEffect, useState } from 'react'
import { Bot, Sparkles, ChevronDown } from 'lucide-react'
import { useAiTools } from '../hooks/useAiTools'
import { extractAiToolFromSkill, stripAiToolTags, getAiToolMeta } from '../lib/aiTools'

const emptyForm = { title: '', category: '', content: '', tags: '', ai_tool: '' }
const CATEGORY_SUGGESTIONS = ['UX/UI', 'Analysis', 'Coding', 'Writing', 'Research', 'Marketing', 'Product', 'DevOps']

export default function SkillFormModal({ open, onClose, onSubmit, initial, saving }) {
  const { tools } = useAiTools()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      const extractedTool = extractAiToolFromSkill(initial) ?? ''
      const cleanTags = stripAiToolTags(initial.tags ?? [])
      setForm({
        title: initial.title ?? '',
        category: initial.category ?? '',
        content: initial.content ?? '',
        tags: cleanTags.join(', '),
        ai_tool: extractedTool,
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
        ai_tool: form.ai_tool.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  const selectedToolMeta = form.ai_tool ? getAiToolMeta(form.ai_tool, tools) : null

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">{initial ? 'แก้ไขสกิล' : 'เพิ่มสกิลใหม่'}</h2>
          {selectedToolMeta && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-xs"
              style={{ backgroundColor: selectedToolMeta.color }}
            >
              <span>{selectedToolMeta.icon || '🤖'}</span>
              <span>{selectedToolMeta.name}</span>
            </span>
          )}
        </div>

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
              <label className="field-label">หมวดหมู่</label>
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

          {/* AI Tool Selector Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label !mb-0 flex items-center gap-1.5">
                <Bot size={15} className="text-[var(--accent)]" />
                เครื่องมือ AI (AI Tool ที่ใช้งาน)
              </label>
              {form.ai_tool && (
                <button
                  type="button"
                  onClick={() => handleChange('ai_tool', '')}
                  className="text-[11px] text-[var(--accent)] hover:underline"
                >
                  ล้างค่า
                </button>
              )}
            </div>

            <div className="relative">
              <select
                className="field !pr-10 cursor-pointer appearance-none"
                value={form.ai_tool}
                onChange={(e) => handleChange('ai_tool', e.target.value)}
              >
                <option value="">-- ไม่ระบุ (ใช้งานได้กับทุก AI) --</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.icon ? `${t.icon} ` : ''}{t.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] pointer-events-none"
              />
            </div>

            {/* Quick AI Tool Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1 flex-nowrap">
              <span className="text-[11px] text-[var(--ink-soft)] shrink-0 flex items-center gap-1">
                <Sparkles size={11} /> แนะนำ:
              </span>
              {tools.slice(0, 5).map((t) => {
                const isActive = form.ai_tool.toLowerCase() === t.name.toLowerCase()
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChange('ai_tool', isActive ? '' : t.name)}
                    className={`chip-filter chip-filter-sm shrink-0 transition-all ${
                      isActive ? '!bg-[var(--accent)] !text-white !border-transparent' : ''
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="ml-1">{t.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="field-label">เนื้อหา</label>
            <textarea
              className="field font-mono text-[13px]"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="เขียนเนื้อหาสกิลที่นี่..."
              rows={7}
            />
          </div>

          <div>
            <label className="field-label">แท็กค้นหา (คั่นด้วยจุลภาค)</label>
            <input
              className="field"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="checklist, heuristics, guidelines"
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
