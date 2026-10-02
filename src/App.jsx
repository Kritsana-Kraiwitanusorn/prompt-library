import { useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { exportPromptsAsJson } from './lib/prompts'
import { extractVariables } from './lib/variables'
import {
  usePromptsQuery,
  useCategoriesQuery,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useToggleFavorite,
  useTogglePin,
  useIncrementCopyCount,
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
import DashboardView from './components/DashboardView'
import SkillsView from './components/SkillsView'
import FilterBar from './components/FilterBar'
import PromptCard from './components/PromptCard'
import { PromptGridSkeleton } from './components/PromptCardSkeleton'
import PromptFormModal from './components/PromptFormModal'
import PromptPreviewModal from './components/PromptPreviewModal'
import VariableFillModal from './components/VariableFillModal'
import ConfirmDialog from './components/ConfirmDialog'
import VersionHistoryModal from './components/VersionHistoryModal'
import EmptyState from './components/EmptyState'

const emptyFilters = { search: '', categoryId: null, tags: [], quick: null, status: null, sort: 'default' }

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
  const incrementCopyCount = useIncrementCopyCount()

  const { message, showToast } = useToast()
  const isOnline = useOnlineStatus()
  const [theme, setTheme] = useTheme()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [historyPrompt, setHistoryPrompt] = useState(null)
  const [previewPrompt, setPreviewPrompt] = useState(null)
  const [variablePrompt, setVariablePrompt] = useState(null)
  const [filters, setFilters] = useState(emptyFilters)
  const [view, setView] = useState('library')
  const searchInputRef = useRef(null)

  const prompts = promptsQuery.data ?? []
  const allTags = useMemo(() => getAllTags(prompts), [prompts])
  const filteredPrompts = useFilteredPrompts(prompts, filters)
  const favoritesCount = useMemo(() => prompts.filter((p) => p.is_favorite).length, [prompts])
  const pinnedCount = useMemo(() => prompts.filter((p) => p.is_pinned).length, [prompts])

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.categoryId ||
    filters.tags.length > 0 ||
    filters.quick !== null ||
    filters.status !== null


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

  function trackCopy(prompt) {
    // Fire-and-forget — never let usage tracking block or fail the copy itself.
    if (typeof prompt.id === 'string' && !prompt.id.startsWith('temp-')) {
      incrementCopyCount.mutate({ id: prompt.id, nextCount: (prompt.copy_count ?? 0) + 1 })
    }
  }

  async function handleCopy(prompt) {
    const variables = extractVariables(prompt.content)
    if (variables.length > 0) {
      setVariablePrompt(prompt)
      return
    }
    try {
      await navigator.clipboard.writeText(prompt.content)
      trackCopy(prompt)
      showToast('คัดลอกแล้ว')
    } catch {
      showToast('คัดลอกไม่สำเร็จ ลองเลือกข้อความเอง')
    }
  }

  function handleVariableCopied(prompt, failed) {
    setVariablePrompt(null)
    if (failed) {
      showToast('คัดลอกไม่สำเร็จ ลองเลือกข้อความเอง')
      return
    }
    trackCopy(prompt)
    showToast('คัดลอกแล้ว')
  }

  // Keyboard shortcuts: "/" focuses search, "n" opens the add-prompt form
  // (only while browsing the library and not already typing somewhere),
  // "Escape" closes whichever overlay is currently open.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (variablePrompt) return setVariablePrompt(null)
        if (previewPrompt) return setPreviewPrompt(null)
        if (historyPrompt) return setHistoryPrompt(null)
        if (deleteTarget) return setDeleteTarget(null)
        if (formOpen) return setFormOpen(false)
        return
      }

      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key.toLowerCase() === 'n' && view === 'library') {
        e.preventDefault()
        openAddForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [variablePrompt, previewPrompt, historyPrompt, deleteTarget, formOpen, view])

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

  if (!isSupabaseConfigured) return <ConfigNotice />

  return (
    <div className="app-shell">
      <Sidebar activeKey={view} onSelect={setView} />

      <div className="main-content">
        <div className="wrap max-w-5xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-10">
          {view === 'settings' && <SettingsView showToast={showToast} theme={theme} onThemeChange={setTheme} />}
          {view === 'trash' && <TrashView showToast={showToast} />}
          {view === 'dashboard' && <DashboardView prompts={prompts} categories={categoriesQuery.data} />}
          {view === 'skills' && <SkillsView showToast={showToast} />}
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
                  searchInputRef={searchInputRef}
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
                  status={filters.status}
                  onStatusChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                  sort={filters.sort}
                  onSortChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
                  onClearAll={() => setFilters(emptyFilters)}
                  hasActiveFilters={hasActiveFilters}
                  totalCount={prompts.length}
                  favoritesCount={favoritesCount}
                  pinnedCount={pinnedCount}
                  filteredCount={filteredPrompts.length}
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
                      onPreview={setPreviewPrompt}
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

      <PromptPreviewModal
        prompt={previewPrompt}
        onClose={() => setPreviewPrompt(null)}
        onCopy={handleCopy}
        onEdit={(p) => {
          setPreviewPrompt(null)
          openEditForm(p)
        }}
      />

      <VariableFillModal
        prompt={variablePrompt}
        onClose={() => setVariablePrompt(null)}
        onCopied={handleVariableCopied}
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
