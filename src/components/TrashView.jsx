import { useState, useMemo } from 'react'
import {
  Trash2,
  RotateCcw,
  Search,
  X,
  FileText,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useDeletedPromptsQuery, useRestorePrompt, useHardDeletePrompt } from '../hooks/usePrompts'
import { useDeletedSkillsQuery, useRestoreSkill, useHardDeleteSkill } from '../hooks/useSkills'
import { extractAiToolFromSkill, getAiToolMeta } from '../lib/aiTools'
import { useAiTools } from '../hooks/useAiTools'
import ConfirmDialog from './ConfirmDialog'

export default function TrashView({ showToast }) {
  const deletedPromptsQuery = useDeletedPromptsQuery()
  const deletedSkillsQuery = useDeletedSkillsQuery()

  const restorePrompt = useRestorePrompt()
  const hardDeletePrompt = useHardDeletePrompt()
  const restoreSkill = useRestoreSkill()
  const hardDeleteSkill = useHardDeleteSkill()

  const { tools } = useAiTools()

  const deletedPrompts = deletedPromptsQuery.data ?? []
  const deletedSkills = deletedSkillsQuery.data ?? []

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'prompts' | 'skills'
  const [search, setSearch] = useState('')

  // Modals state
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null)
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false)
  const [restoreAllOpen, setRestoreAllOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Normalize items for unified listing
  const allItems = useMemo(() => {
    const pItems = deletedPrompts.map((p) => ({
      id: p.id,
      type: 'prompt',
      title: p.title,
      content: p.content,
      categoryName: p.category?.name,
      categoryColor: p.category?.color,
      aiTool: null,
      updatedAt: p.updated_at,
      raw: p,
    }))

    const sItems = deletedSkills.map((s) => {
      const toolName = extractAiToolFromSkill(s)
      return {
        id: s.id,
        type: 'skill',
        title: s.title,
        content: s.content,
        categoryName: s.category,
        categoryColor: 'var(--accent)',
        aiTool: toolName ? getAiToolMeta(toolName, tools) : null,
        updatedAt: s.updated_at,
        raw: s,
      }
    })

    return [...pItems, ...sItems].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [deletedPrompts, deletedSkills, tools])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allItems.filter((item) => {
      if (activeTab === 'prompts' && item.type !== 'prompt') return false
      if (activeTab === 'skills' && item.type !== 'skill') return false
      if (q) {
        const text = [item.title, item.content, item.categoryName, item.aiTool?.name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [allItems, activeTab, search])

  // Single Item Actions
  async function handleRestoreItem(item) {
    try {
      if (item.type === 'prompt') {
        await restorePrompt.mutateAsync(item.raw)
      } else {
        await restoreSkill.mutateAsync(item.id)
      }
      showToast(`กู้คืน "${item.title}" สำเร็จ`)
    } catch {
      showToast('เกิดข้อผิดพลาดในการกู้คืน')
    }
  }

  async function handleConfirmHardDelete() {
    if (!confirmDeleteTarget) return
    try {
      if (confirmDeleteTarget.type === 'prompt') {
        await hardDeletePrompt.mutateAsync(confirmDeleteTarget.raw)
      } else {
        await hardDeleteSkill.mutateAsync(confirmDeleteTarget.id)
      }
      showToast(`ลบ "${confirmDeleteTarget.title}" ถาวรแล้ว`)
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบ')
    } finally {
      setConfirmDeleteTarget(null)
    }
  }

  // Bulk Actions
  async function handleEmptyAllTrash() {
    setIsProcessing(true)
    try {
      for (const p of deletedPrompts) {
        await hardDeletePrompt.mutateAsync(p)
      }
      for (const s of deletedSkills) {
        await hardDeleteSkill.mutateAsync(s.id)
      }
      showToast('ล้างถังขยะทั้งหมดเรียบร้อยแล้ว')
    } catch {
      showToast('เกิดข้อผิดพลาดในการล้างถังขยะ')
    } finally {
      setIsProcessing(false)
      setEmptyTrashOpen(false)
    }
  }

  async function handleRestoreAllTrash() {
    setIsProcessing(true)
    try {
      for (const p of deletedPrompts) {
        await restorePrompt.mutateAsync(p)
      }
      for (const s of deletedSkills) {
        await restoreSkill.mutateAsync(s.id)
      }
      showToast('กู้คืนทุกรายการเรียบร้อยแล้ว')
    } catch {
      showToast('เกิดข้อผิดพลาดในการกู้คืน')
    } finally {
      setIsProcessing(false)
      setRestoreAllOpen(false)
    }
  }

  const isLoading = deletedPromptsQuery.isPending || deletedSkillsQuery.isPending

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Top Header Card */}
      <div className="settings-card !p-5 sm:!p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow font-mono">RECOVERY HUB</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
              <RotateCcw size={11} /> ถังขยะ
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">ถังขยะและศูนย์กู้คืน</h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1 max-w-xl">
            พรอมต์และสกิลที่ถูกลบจะถูกพักไว้ที่นี่ สามารถเลือกกู้คืนกลับสู่คลังได้ทุกเมื่อ หรือลบถาวรเพื่อคืนพื้นที่
          </p>
        </div>

        {allItems.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              className="btn btn-sm flex-1 sm:flex-initial"
              onClick={() => setRestoreAllOpen(true)}
              disabled={isProcessing}
            >
              <RotateCcw size={13} strokeWidth={1.8} /> กู้คืนทั้งหมด
            </button>
            <button
              className="btn btn-sm btn-stamp flex-1 sm:flex-initial"
              onClick={() => setEmptyTrashOpen(true)}
              disabled={isProcessing}
            >
              <Trash2 size={13} strokeWidth={1.8} /> ล้างถังขยะ ({allItems.length})
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        <div className="stat-card !p-3 sm:!p-4">
          <span className="text-[11px] sm:text-xs text-[var(--ink-soft)] font-medium">รวมในถังขยะ</span>
          <span className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] mt-0.5">
            {allItems.length}
          </span>
        </div>
        <div className="stat-card !p-3 sm:!p-4">
          <span className="text-[11px] sm:text-xs text-[var(--ink-soft)] font-medium">พรอมต์ที่ลบ</span>
          <span className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] mt-0.5">
            {deletedPrompts.length}
          </span>
        </div>
        <div className="stat-card !p-3 sm:!p-4">
          <span className="text-[11px] sm:text-xs text-[var(--ink-soft)] font-medium">สกิลที่ลบ</span>
          <span className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] mt-0.5">
            {deletedSkills.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {allItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
          {/* Segmented Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`chip-filter !font-medium shrink-0 ${activeTab === 'all' ? 'chip-filter-active' : ''}`}
            >
              ทั้งหมด ({allItems.length})
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`chip-filter !font-medium shrink-0 ${activeTab === 'prompts' ? 'chip-filter-active' : ''}`}
            >
              <FileText size={12} className="mr-1 inline" /> พรอมต์ ({deletedPrompts.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`chip-filter !font-medium shrink-0 ${activeTab === 'skills' ? 'chip-filter-active' : ''}`}
            >
              <GraduationCap size={13} className="mr-1 inline" /> สกิล ({deletedSkills.length})
            </button>
          </div>

          {/* Search Box with field-search so icon and text do not overlap */}
          <div className="relative sm:w-72">
            <input
              className="field field-search w-full !py-2 text-xs sm:text-sm"
              placeholder="ค้นหาในถังขยะ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              size={15}
              strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] pointer-events-none"
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="idx-card animate-pulse !p-4">
              <div className="h-4 w-32 bg-black/10 rounded mb-2" />
              <div className="h-3 w-4/5 bg-black/5 rounded mb-2" />
              <div className="h-3 w-1/2 bg-black/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no items in trash */}
      {!isLoading && allItems.length === 0 && (
        <div className="settings-card text-center py-14 px-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-3xl mb-4 shadow-sm">
            🗑️
          </div>
          <h3 className="font-display text-lg font-bold">ถังขยะว่างเปล่า</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1.5 max-w-sm">
            ไม่มีรายการใดที่ถูกลบอยู่ในถังขยะ คลังข้อมูลของคุณสะอาดและพร้อมใช้งาน
          </p>
        </div>
      )}

      {/* Empty Search State */}
      {!isLoading && allItems.length > 0 && filteredItems.length === 0 && (
        <div className="settings-card text-center py-10 px-4">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-semibold">ไม่พบผลลัพธ์ในถังขยะ</p>
          <p className="text-xs text-[var(--ink-soft)] mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภทรายการ</p>
          <button className="btn btn-sm mt-3" onClick={() => setSearch('')}>
            ล้างคำค้นหา
          </button>
        </div>
      )}

      {/* Items List */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="idx-card !p-4 hover:!translate-y-0 border border-[var(--glass-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {/* Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.type === 'prompt'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.type === 'prompt' ? <FileText size={10} /> : <GraduationCap size={11} />}
                    {item.type === 'prompt' ? 'พรอมต์' : 'สกิล'}
                  </span>

                  {/* AI Tool Badge */}
                  {item.aiTool && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shadow-2xs"
                      style={{ backgroundColor: item.aiTool.color }}
                    >
                      <span>{item.aiTool.icon || '🤖'}</span>
                      <span>{item.aiTool.name}</span>
                    </span>
                  )}

                  {/* Category */}
                  {item.categoryName && (
                    <span className="text-[11px] text-[var(--ink-soft)] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.categoryColor }} />
                      {item.categoryName}
                    </span>
                  )}

                  {/* Date */}
                  <span className="text-[10.5px] text-[var(--ink-soft)] font-mono ml-auto sm:ml-0">
                    {new Date(item.updatedAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                </div>

                <h4 className="font-display font-semibold text-sm sm:text-base text-[var(--ink)] line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-[var(--ink-soft)] line-clamp-2 mt-1 font-mono">{item.content}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--glass-line)]">
                <button
                  className="btn btn-sm flex-1 sm:flex-initial"
                  title="กู้คืนรายการนี้กลับไปคลัง"
                  onClick={() => handleRestoreItem(item)}
                  disabled={isProcessing}
                >
                  <RotateCcw size={13} strokeWidth={2} /> กู้คืน
                </button>
                <button
                  className="btn btn-sm btn-stamp flex-1 sm:flex-initial"
                  title="ลบถาวร ไม่สามารถกู้คืนได้อีก"
                  onClick={() => setConfirmDeleteTarget(item)}
                  disabled={isProcessing}
                >
                  <Trash2 size={13} strokeWidth={2} /> ลบถาวร
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog: Single Item Permanent Delete */}
      <ConfirmDialog
        open={Boolean(confirmDeleteTarget)}
        title="ลบถาวรหรือไม่?"
        description={
          confirmDeleteTarget
            ? `"${confirmDeleteTarget.title}" (${
                confirmDeleteTarget.type === 'prompt' ? 'พรอมต์' : 'สกิล'
              }) จะถูกลบทิ้งจากฐานข้อมูลทันที และไม่สามารถกู้คืนได้อีก`
            : ''
        }
        confirmLabel="ยืนยันการลบถาวร"
        danger
        busy={hardDeletePrompt.isPending || hardDeleteSkill.isPending}
        onConfirm={handleConfirmHardDelete}
        onCancel={() => setConfirmDeleteTarget(null)}
      />

      {/* Confirmation Dialog: Empty All Trash */}
      <ConfirmDialog
        open={emptyTrashOpen}
        title="ล้างถังขยะทั้งหมด?"
        description={`การล้างถังขยะจะลบทั้ง ${allItems.length} รายการ (รวมทั้งประวัติเวอร์ชันและรูปภาพ) อย่างถาวร ไม่สามารถกู้คืนได้อีกเลย`}
        confirmLabel="ล้างถังขยะทันที"
        danger
        busy={isProcessing}
        onConfirm={handleEmptyAllTrash}
        onCancel={() => setEmptyTrashOpen(false)}
      />

      {/* Confirmation Dialog: Restore All Trash */}
      <ConfirmDialog
        open={restoreAllOpen}
        title="กู้คืนทั้งหมด?"
        description={`ต้องการกู้คืนทั้ง ${allItems.length} รายการกลับไปยังคลังพรอมต์และคลังสกิลหรือไม่?`}
        confirmLabel="กู้คืนทั้งหมด"
        busy={isProcessing}
        onConfirm={handleRestoreAllTrash}
        onCancel={() => setRestoreAllOpen(false)}
      />
    </div>
  )
}
