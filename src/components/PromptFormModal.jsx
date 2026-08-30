import { useEffect, useRef, useState } from 'react'
import { uploadPromptImage, deletePromptImage } from '../lib/prompts'

const emptyForm = { title: '', content: '', category_id: '', tags: '' }

export default function PromptFormModal({ open, onClose, onSubmit, categories, initial, saving }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null) // shown thumbnail (existing URL or local object URL)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title ?? '',
        content: initial.content ?? '',
        category_id: initial.category_id ?? '',
        tags: (initial.tags ?? []).join(', '),
      })
      setImagePreview(initial.image_url ?? null)
    } else {
      setForm(emptyForm)
      setImagePreview(null)
    }
    setImageFile(null)
    setImageRemoved(false)
    setError('')
  }, [open, initial])

  if (!open) return null

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageRemoved(false)
  }

  function handleRemoveImage(e) {
    e.stopPropagation()
    setImageFile(null)
    setImagePreview(null)
    setImageRemoved(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('กรุณากรอกชื่อและเนื้อหาพรอมต์')
      return
    }
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      let image_url = initial?.image_url ?? null

      if (imageFile) {
        setUploading(true)
        image_url = await uploadPromptImage(imageFile)
        setUploading(false)
      } else if (imageRemoved) {
        image_url = null
      }

      await onSubmit({
        title: form.title.trim(),
        content: form.content.trim(),
        category_id: form.category_id || null,
        tags,
        image_url,
      })

      // Best-effort cleanup of the old file — never blocks the save above.
      if ((imageFile || imageRemoved) && initial?.image_url && initial.image_url !== image_url) {
        deletePromptImage(initial.image_url)
      }

      onClose()
    } catch (err) {
      setUploading(false)
      setError(err.message ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  const busy = saving || uploading

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="font-display text-xl font-semibold mb-1">
          {initial ? 'แก้ไขพรอมต์' : 'เพิ่มพรอมต์ใหม่'}
        </h2>
        <p className="text-sm text-[var(--ink-soft)] mb-5">
          {initial
            ? 'การแก้ไขชื่อหรือเนื้อหาจะถูกบันทึกเป็นเวอร์ชันใหม่โดยอัตโนมัติ'
            : 'บันทึกพรอมต์ที่ใช้บ่อยเพื่อเรียกใช้และแชร์ให้ทีมได้ภายหลัง'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label">ชื่อพรอมต์</label>
            <input
              className="field"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="เช่น ปรับโทนอีเมลให้สุภาพขึ้น"
              autoFocus
            />
          </div>

          <div>
            <label className="field-label">เนื้อหาพรอมต์</label>
            <textarea
              className="field font-mono text-[13px]"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="พิมพ์พรอมต์ของคุณที่นี่..."
              rows={6}
            />
          </div>

          <div>
            <label className="field-label">รูปตัวอย่าง (ถ้ามี)</label>
            <div className="image-drop" onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="ตัวอย่าง" className="image-drop-preview" />
              ) : (
                <span className="image-drop-placeholder">🖼️</span>
              )}
              <span className="image-drop-text">
                {imagePreview ? 'คลิกเพื่อเปลี่ยนรูป' : 'อัปโหลดรูปผลลัพธ์ตัวอย่าง เช่น จาก prompt สร้างภาพ'}
              </span>
              {imagePreview && (
                <button type="button" className="image-drop-remove" onClick={handleRemoveImage}>
                  ลบรูป
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">หมวดหมู่</label>
              <select
                className="field"
                value={form.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
              >
                <option value="">— ไม่ระบุ —</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">แท็ก (คั่นด้วยจุลภาค)</label>
              <input
                className="field"
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="อีเมล, โทนเสียง"
              />
            </div>
          </div>

          {error && <p className="text-sm text-[var(--stamp)]">{error}</p>}

          <div className="modal-actions mt-1">
            <button type="button" className="btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-solid" disabled={busy}>
              {uploading ? 'กำลังอัปโหลดรูป…' : saving ? 'กำลังบันทึก…' : initial ? 'บันทึกการแก้ไข' : 'เพิ่มพรอมต์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
