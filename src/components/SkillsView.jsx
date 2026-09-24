import { useState } from 'react'
import { Plus, Pencil, Trash2, Copy } from 'lucide-react'
import { useSkillsQuery, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../hooks/useSkills'
import SkillFormModal from './SkillFormModal'
import ConfirmDialog from './ConfirmDialog'

export default function SkillsView({ showToast }) {
  const skillsQuery = useSkillsQuery()
  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const deleteSkill = useDeleteSkill()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const skills = skillsQuery.data ?? []

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(skill) {
    setEditing(skill)
    setFormOpen(true)
  }

  async function handleSubmit(fields) {
    if (editing) {
      await updateSkill.mutateAsync({ id: editing.id, fields })
      showToast('บันทึกการแก้ไขแล้ว')
    } else {
      await createSkill.mutateAsync(fields)
      showToast('เพิ่มสกิลแล้ว')
    }
  }

  async function handleCopy(skill) {
    try {
      await navigator.clipboard.writeText(skill.content)
      showToast('คัดลอกแล้ว')
    } catch {
      showToast('คัดลอกไม่สำเร็จ')
    }
  }

  async function handleConfirmDelete() {
    await deleteSkill.mutateAsync(deleteTarget.id)
    showToast('ลบสกิลแล้ว')
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow font-mono">SKILLS</span>
          <h2 className="font-display text-2xl font-medium mt-3">สกิล</h2>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            เก็บข้อมูลอ้างอิง เช่น เกณฑ์ UX/UI, checklist การวิเคราะห์ — แยกจากพรอมต์
          </p>
        </div>
        <button className="btn btn-solid" onClick={openAdd}>
          <Plus size={15} strokeWidth={2} /> เพิ่มสกิล
        </button>
      </div>

      {skillsQuery.isPending && <p className="text-sm text-[var(--ink-soft)]">กำลังโหลด…</p>}

      {skillsQuery.isSuccess && skills.length === 0 && (
        <div className="settings-card settings-card-muted text-center py-10">
          <p className="text-2xl mb-2">🎓</p>
          <p className="text-sm text-[var(--ink-soft)]">ยังไม่มีสกิลที่บันทึกไว้</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => (
            <div key={s.id} className="idx-card">
              <div className="flex items-center justify-between gap-2 mb-2">
                {s.category && <span className="text-[11px] text-[var(--ink-soft)]">{s.category}</span>}
                <div className="flex gap-1 shrink-0 ml-auto">
                  <button className="btn-icon" title="แก้ไข" onClick={() => openEdit(s)}>
                    <Pencil size={13} strokeWidth={1.8} />
                  </button>
                  <button className="btn-icon" title="ลบ" onClick={() => setDeleteTarget(s)}>
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <p className="card-title">{s.title}</p>
              <p className="card-snip">{s.content}</p>
              {s.tags?.length > 0 && (
                <div className="flex flex-wrap mb-2">
                  {s.tags.map((t) => (
                    <span key={t} className="tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <button className="btn btn-sm btn-teal mt-auto" onClick={() => handleCopy(s)}>
                <Copy size={13} strokeWidth={1.8} /> คัดลอก
              </button>
            </div>
          ))}
        </div>
      )}

      <SkillFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        saving={createSkill.isPending || updateSkill.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ลบสกิลนี้?"
        description={deleteTarget ? `"${deleteTarget.title}" จะถูกลบทันที (ไม่มีถังขยะสำหรับสกิล)` : ''}
        confirmLabel="ลบ"
        danger
        busy={deleteSkill.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
