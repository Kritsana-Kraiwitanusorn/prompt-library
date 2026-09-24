import { useState } from 'react'
import { extractVariables, fillVariables } from '../lib/variables'

export default function VariableFillModal({ prompt, onClose, onCopied }) {
  const variables = prompt ? extractVariables(prompt.content) : []
  const [values, setValues] = useState({})

  if (!prompt) return null

  const filled = fillVariables(prompt.content, values)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(filled)
      onCopied(prompt)
    } catch {
      onCopied(prompt, true)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="font-display text-xl font-semibold mb-1">กรอกตัวแปรก่อนคัดลอก</h2>
        <p className="text-sm text-[var(--ink-soft)] mb-5">{prompt.title}</p>

        <div className="flex flex-col gap-4 mb-4">
          {variables.map((name) => (
            <div key={name}>
              <label className="field-label">
                <span className="var-chip mr-1.5">{`{{${name}}}`}</span>
              </label>
              <input
                className="field"
                value={values[name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                placeholder={`ใส่ค่าแทน ${name}`}
                autoFocus={name === variables[0]}
              />
            </div>
          ))}
        </div>

        <label className="field-label">ตัวอย่างข้อความที่จะคัดลอก</label>
        <div className="field font-mono text-[12.5px] whitespace-pre-wrap max-h-40 overflow-y-auto mb-2 !bg-[var(--canvas)]">
          {filled}
        </div>

        <div className="modal-actions mt-3">
          <button className="btn" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn btn-teal" onClick={handleCopy}>
            คัดลอก
          </button>
        </div>
      </div>
    </div>
  )
}
