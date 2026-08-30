import { useState } from 'react'
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/usePrompts'
import CategoryFormModal from './CategoryFormModal'
import ConfirmDialog from './ConfirmDialog'

export default function CategoryManager({ showToast }) {
  const categoriesQuery = useCategoriesQuery()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function handleSubmit(fields) {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, fields })
      showToast('บันทึกหมวดหมู่แล้ว')
    } else {
      await createCategory.mutateAsync(fields)
      showToast('เพิ่มหมวดหมู่แล้ว')
    }
  }

  async function handleConfirmDelete() {
    await deleteCategory.mutateAsync(deleteTarget.id)
    showToast('ลบหมวดหมู่แล้ว')
    setDeleteTarget(null)
  }

  const categories = categoriesQuery.data ?? []

  return (
    <div className="settings-card">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-display text-lg font-semibold">หมวดหมู่</h3>
          <p className="text-sm text-[var(--ink-soft)]">จัดกลุ่มพรอมต์ให้ค้นหาง่ายขึ้น เพิ่มหรือลบได้ตลอดเวลา</p>
        </div>
        <button className="btn btn-sm btn-solid" onClick={() => { setEditing(null); setFormOpen(true) }}>
          + เพิ่มหมวดหมู่
        </button>
      </div>

      {categoriesQuery.isPending && <p className="text-sm text-[var(--ink-soft)] mt-4">กำลังโหลด…</p>}

      {categories.length === 0 && !categoriesQuery.isPending && (
        <p className="text-sm text-[var(--ink-soft)] mt-4">ยังไม่มีหมวดหมู่ เริ่มเพิ่มอันแรกได้เลย</p>
      )}

      {categories.length > 0 && (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id} className="category-row">
              <span className="swatch-dot" style={{ backgroundColor: c.color }} />
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <button className="btn-text-clear !text-[var(--ink-soft)] !no-underline mr-3" onClick={() => { setEditing(c); setFormOpen(true) }}>
                แก้ไข
              </button>
              <button className="btn-text-clear" onClick={() => setDeleteTarget(c)}>
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        saving={createCategory.isPending || updateCategory.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ลบหมวดหมู่นี้?"
        description={deleteTarget ? `พรอมต์ที่ใช้หมวดหมู่ "${deleteTarget.name}" จะกลายเป็น "ไม่ระบุ" (ตัวพรอมต์เองไม่หายไป)` : ''}
        confirmLabel="ลบ"
        danger
        busy={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
