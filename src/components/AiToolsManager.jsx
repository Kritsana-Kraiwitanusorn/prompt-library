import { useState, useMemo } from 'react'
import { Plus, Trash2, Pencil, RotateCcw, Bot, Check } from 'lucide-react'
import { useAiTools } from '../hooks/useAiTools'
import { useSkillsQuery } from '../hooks/useSkills'
import { extractAiToolFromSkill } from '../lib/aiTools'

const COLOR_PRESETS = [
  '#10A37F', // OpenAI Green
  '#D97706', // Anthropic Amber
  '#4F46E5', // Gemini Indigo
  '#0284C7', // DeepSeek Cyan
  '#6366F1', // Cursor Violet
  '#2563EB', // Copilot Blue
  '#EC4899', // Midjourney Pink
  '#0D9488', // Perplexity Teal
  '#8B5CF6', // Purple
  '#E11D48', // Rose
  '#1A1A1A', // Neutral Dark
]

const EMOJI_PRESETS = ['🤖', '🧠', '✨', '⚡', '🛸', '🎨', '🔍', '▲', '💬', '💡', '🛡️', '⚙️']

export default function AiToolsManager({ showToast }) {
  const { tools, addTool, updateTool, deleteTool, reset } = useAiTools()
  const skillsQuery = useSkillsQuery()
  const skills = skillsQuery.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🤖')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // Compute skill usage counts for each AI tool
  const usageCounts = useMemo(() => {
    const map = {}
    skills.forEach((s) => {
      const toolName = extractAiToolFromSkill(s)
      if (toolName) {
        const key = toolName.toLowerCase()
        map[key] = (map[key] || 0) + 1
      }
    })
    return map
  }, [skills])

  function openCreate() {
    setEditingId(null)
    setName('')
    setIcon('🤖')
    setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)])
    setDescription('')
    setError('')
    setFormOpen(true)
  }

  function openEdit(tool) {
    setEditingId(tool.id)
    setName(tool.name)
    setIcon(tool.icon || '🤖')
    setColor(tool.color || COLOR_PRESETS[0])
    setDescription(tool.description || '')
    setError('')
    setFormOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('กรุณาระบุชื่อเครื่องมือ AI')
      return
    }

    if (editingId) {
      updateTool(editingId, { name: trimmed, icon, color, description: description.trim() })
      showToast(`อัปเดต "${trimmed}" แล้ว`)
    } else {
      addTool({ name: trimmed, icon, color, description: description.trim() })
      showToast(`เพิ่มเครื่องมือ "${trimmed}" แล้ว`)
    }
    setFormOpen(false)
  }

  function handleDelete(tool) {
    deleteTool(tool.id)
    showToast(`ลบเครื่องมือ "${tool.name}" แล้ว`)
  }

  function handleReset() {
    if (window.confirm('ต้องการรีเซ็ตรายการเครื่องมือ AI เป็นค่าเริ่มต้นหรือไม่?')) {
      reset()
      showToast('รีเซ็ตเป็นค่าเริ่มต้นแล้ว')
    }
  }

  return (
    <div className="settings-card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--glass-line)]">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold flex items-center gap-2">
            <Bot size={18} className="text-[var(--accent)]" />
            จัดการเครื่องมือ AI (AI Tools)
          </h3>
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">
            กำหนด AI โมเดลและเครื่องมือที่ใช้สำหรับจัดหมวดหมู่สกิลและพรอมต์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={handleReset} title="รีเซ็ตเป็นค่าเริ่มต้น">
            <RotateCcw size={12} strokeWidth={2} /> ค่าเริ่มต้น
          </button>
          <button className="btn btn-sm btn-solid" onClick={openCreate}>
            <Plus size={13} strokeWidth={2.2} /> เพิ่ม AI Tool
          </button>
        </div>
      </div>

      {/* Inline Form Modal / Collapse */}
      {formOpen && (
        <form
          onSubmit={handleSave}
          className="p-4 rounded-2xl bg-black/[0.03] border border-[var(--glass-line)] flex flex-col gap-3.5 animation-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold text-[var(--ink)]">
              {editingId ? 'แก้ไขเครื่องมือ AI' : 'เพิ่มเครื่องมือ AI ใหม่'}
            </h4>
            <button
              type="button"
              className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
              onClick={() => setFormOpen(false)}
            >
              ยกเลิก
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="field-label !text-xs">ชื่อเครื่องมือ AI</label>
              <input
                className="field !py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Grok, Midjourney, Claude 3.7"
                autoFocus
              />
            </div>

            <div>
              <label className="field-label !text-xs">ไอคอน / Emoji</label>
              <div className="flex items-center gap-2">
                <input
                  className="field !py-2 !w-14 text-center text-base"
                  value={icon}
                  maxLength={4}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                  {EMOJI_PRESETS.slice(0, 5).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className="w-8 h-8 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-sm shrink-0"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="field-label !text-xs">คำอธิบายย่อ (ทางเลือก)</label>
            <input
              className="field !py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น Anthropic Claude, OpenAI Reasoning Model"
            />
          </div>

          <div>
            <label className="field-label !text-xs">สีประจำเครื่องมือ (Brand Color)</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-[var(--ink)] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent ml-2"
                title="เลือกสีเอง"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[var(--stamp)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-sm" onClick={() => setFormOpen(false)}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-sm btn-solid">
              <Check size={12} /> {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเครื่องมือ'}
            </button>
          </div>
        </form>
      )}

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {tools.map((tool) => {
          const count = usageCounts[tool.name.toLowerCase()] || 0
          return (
            <div
              key={tool.id}
              className="p-3 rounded-xl bg-black/[0.02] border border-[var(--glass-line)] flex items-center justify-between gap-2.5 hover:bg-black/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 text-white shadow-2xs"
                  style={{ backgroundColor: tool.color }}
                >
                  {tool.icon || '🤖'}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-semibold text-xs sm:text-sm text-[var(--ink)] truncate">
                      {tool.name}
                    </p>
                    {count > 0 && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shrink-0">
                        {count} สกิล
                      </span>
                    )}
                  </div>
                  {tool.description && (
                    <p className="text-[11px] text-[var(--ink-soft)] truncate max-w-[150px]">
                      {tool.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="btn-icon !w-7 !h-7"
                  title="แก้ไข"
                  onClick={() => openEdit(tool)}
                >
                  <Pencil size={11} />
                </button>
                <button
                  className="btn-icon !w-7 !h-7 hover:!text-[var(--stamp)]"
                  title="ลบ"
                  onClick={() => handleDelete(tool)}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
