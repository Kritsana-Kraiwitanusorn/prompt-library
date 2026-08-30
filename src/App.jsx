import { useMemo, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { exportPromptsAsJson } from './lib/prompts'
import {
  usePromptsQuery,
  useCategoriesQuery,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useToggleFavorite,
  useTogglePin,
  useRestoreVersion,
  useImportPrompts,
} from './hooks/usePrompts'
import { useToast } from './hooks/useToast'
import { useFilteredPrompts, getAllTags } from './hooks/useFilteredPrompts'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useTheme } from './hooks/useTheme'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import SettingsView from './components/SettingsView'
import TrashView from './components/TrashView'
import FilterBar from './components/FilterBar'
import PromptCard from './components/PromptCard'
import { PromptGridSkeleton } from './components/PromptCardSkeleton'
import PromptFormModal from './components/PromptFormModal'
import ConfirmDialog from './components/ConfirmDialog'
import VersionHistoryModal from './components/VersionHistoryModal'
import EmptyState from './components/EmptyState'

const emptyFilters = { search: '', categoryId: null, tags: [], quick: null, sort: 'default' }

function ConfigNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="idx-card max-w-md">
        <p className="card-title">ยังไม่ได้ตั้งค่า Supabase</p>
        <p className="card-snip">
          คัดลอก <code className="font-mono">.env.example</code> เป็น{' '}
          <code className="font-mono">.env.local</code> แล้วใส่ค่า Supabase URL และ anon key ของคุณ
          จากนั้นรัน <code className="font-mono">npm run dev</code> ใหม่
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const promptsQuery = usePromptsQuery()
  const categoriesQuery = useCategoriesQuery()

  const createPrompt = useCreatePrompt()
  const updatePrompt = useUpdatePrompt()
  const deletePrompt = useDeletePrompt()
  const toggleFavorite = useToggleFavorite()
  const togglePin = useTogglePin()
  const restoreVersion = useRestoreVersion()
  const importPrompts = useImportPrompts()

  const { message, showToast } = useToast()
  const isOnline = useOnlineStatus()
  const [theme, setTheme] = useTheme()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [historyPrompt, setHistoryPrompt] = useState(null)
  const [filters, setFilters] = useState(emptyFilters)
  const [view, setView] = useState('library')

  const prompts = promptsQuery.data ?? []
  const allTags = useMemo(() => getAllTags(prompts), [prompts])
  const filteredPrompts = useFilteredPrompts(prompts, filters)
  const hasActiveFilters =
    filters.search.trim() !== '' || filters.categoryId || filters.tags.length > 0 || filters.quick !== null

  // "รายการโปรด" in the sidebar isn't a separate page — it's a shortcut into
  // the library view pre-filtered to favorites, so it reuses all the same
  // filtering/rendering logic instead of duplicating it.
  const activeNav = view === 'library' && filters.quick === 'favorite' ? 'favorites' : view

  function handleNavSelect(key) {
    if (key === 'favorites') {
      setView('library')
      setFilters((f) => ({ ...f, quick: 'favorite' }))
    } else if (key === 'library') {
      setView('library')
      setFilters((f) => ({ ...f, quick: null }))
    } else {
      setView(key)
    }
  }

  if (!isSupabaseConfigured) return <ConfigNotice />

  function openAddForm() {
    setEditingPrompt(null)
    setFormOpen(true)
  }

  function openEditForm(prompt) {
    setEditingPrompt(prompt)
    setFormOpen(true)
  }

  async function handleFormSubmit(fields) {
    if (editingPrompt) {
      await updatePrompt.mutateAsync({ id: editingPrompt.id, fields })
      showToast('บันทึกการแก้ไขแล้ว')
    } else {
      await createPrompt.mutateAsync(fields)
      showToast('เพิ่มพรอมต์แล้ว')
    }
  }

  async function handleCopy(prompt) {
    try {
      await navigator.clipboard.writeText(prompt.content)
      showToast('คัดลอกแล้ว')
    } catch {
      showToast('คัดลอกไม่สำเร็จ ลองเลือกข้อความเอง')
    }
  }

  async function handleConfirmDelete() {
    await deletePrompt.mutateAsync(deleteTarget.id)
    showToast('ลบพรอมต์แล้ว')
    setDeleteTarget(null)
  }

  async function handleExport() {
    const json = await exportPromptsAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('ส่งออกไฟล์แล้ว')
  }

  async function handleImportFile(file) {
    try {
      const text = await file.text()
      const imported = await importPrompts.mutateAsync(text)
      showToast(`นำเข้า ${imported.length} พรอมต์แล้ว`)
    } catch (err) {
      showToast(err.message ?? 'นำเข้าไฟล์ไม่สำเร็จ')
    }
  }

  async function handleRestoreVersion(promptId, version) {
    await restoreVersion.mutateAsync({ promptId, version })
    showToast(`กู้คืนเป็น v${version} แล้ว`)
  }

  return (
    <div className="app-shell">
      <Sidebar activeKey={activeNav} onSelect={handleNavSelect} />

      <div className="main-content">
        <div className="wrap max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {view === 'settings' && <SettingsView showToast={showToast} theme={theme} onThemeChange={setTheme} />}
          {view === 'trash' && <TrashView showToast={showToast} />}
          {view === 'library' && (
            <>
              <Toolbar
                onAdd={openAddForm}
                onExport={handleExport}
                onImportFile={handleImportFile}
                promptCount={prompts.length}
                disabled={!isOnline}
              />

              {!isOnline && (
                <div className="offline-banner">
                  ⚠️ ออฟไลน์อยู่ — กำลังแสดงข้อมูลที่แคชไว้ล่าสุด การเพิ่ม/แก้ไข/ลบจะซิงก์เมื่อกลับมามีเน็ต
                </div>
              )}

              {promptsQuery.isPending && <PromptGridSkeleton />}

              {promptsQuery.isError && (
                <p className="text-sm text-[var(--stamp)]">โหลดข้อมูลไม่สำเร็จ: {promptsQuery.error.message}</p>
              )}

              {promptsQuery.isSuccess && prompts.length > 0 && (
                <FilterBar
                  search={filters.search}
                  onSearchChange={(v) => setFilters((f) => ({ ...f, search: v }))}
                  categories={categoriesQuery.data}
                  categoryId={filters.categoryId}
                  onCategoryChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
                  allTags={allTags}
                  activeTags={filters.tags}
                  onToggleTag={(t) =>
                    setFilters((f) => ({
                      ...f,
                      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
                    }))
                  }
                  quick={filters.quick}
                  onQuickChange={(v) => setFilters((f) => ({ ...f, quick: v }))}
                  sort={filters.sort}
                  onSortChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
                  onClearAll={() => setFilters(emptyFilters)}
                  hasActiveFilters={hasActiveFilters}
                />
              )}

              {promptsQuery.isSuccess && prompts.length === 0 && <EmptyState onAdd={openAddForm} />}

              {promptsQuery.isSuccess && prompts.length > 0 && filteredPrompts.length === 0 && (
                <EmptyState filtered onClearFilters={() => setFilters(emptyFilters)} />
              )}

              {filteredPrompts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrompts.map((p, i) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      onEdit={openEditForm}
                      onDelete={setDeleteTarget}
                      onCopy={handleCopy}
                      onToggleFavorite={(pr) => toggleFavorite.mutate({ id: pr.id, value: !pr.is_favorite })}
                      onTogglePin={(pr) => togglePin.mutate({ id: pr.id, value: !pr.is_pinned })}
                      onViewHistory={setHistoryPrompt}
                      disabled={!isOnline || p._optimistic}
                      style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PromptFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categoriesQuery.data}
        initial={editingPrompt}
        saving={createPrompt.isPending || updatePrompt.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ลบพรอมต์นี้?"
        description={deleteTarget ? `"${deleteTarget.title}" จะถูกย้ายไปยังถังขยะ (กู้คืนได้ภายหลัง)` : ''}
        confirmLabel="ลบ"
        danger
        busy={deletePrompt.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <VersionHistoryModal
        prompt={historyPrompt}
        onClose={() => setHistoryPrompt(null)}
        onRestore={handleRestoreVersion}
        restoring={restoreVersion.isPending}
      />

      {message && <div className="toast">{message}</div>}
    </div>
  )
}
