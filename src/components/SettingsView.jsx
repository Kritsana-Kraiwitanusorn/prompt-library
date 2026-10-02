import { useState, useRef } from 'react'
import {
  Palette,
  Bot,
  FolderTree,
  Database,
  Info,
  Download,
  Upload,
  CheckCircle2,
  HardDrive,
  Trash2,
  Keyboard,
  Sparkles,
} from 'lucide-react'
import CategoryManager from './CategoryManager'
import AiToolsManager from './AiToolsManager'
import ThemeSwitcher from './ThemeSwitcher'
import { usePromptsQuery, useImportPrompts } from '../hooks/usePrompts'
import { useSkillsQuery, useImportSkills } from '../hooks/useSkills'
import { useCategoriesQuery } from '../hooks/usePrompts'
import { useAiTools } from '../hooks/useAiTools'
import { exportPromptsAsJson } from '../lib/prompts'
import { exportSkillsAsJson } from '../lib/skills'

const TABS = [
  { id: 'appearance', label: 'ลักษณะทั่วไป', icon: Palette },
  { id: 'aitools', label: 'เครื่องมือ AI', icon: Bot },
  { id: 'categories', label: 'หมวดหมู่', icon: FolderTree },
  { id: 'data', label: 'ข้อมูลและการสำรอง', icon: Database },
  { id: 'about', label: 'คีย์ลัดและระบบ', icon: Info },
]

export default function SettingsView({ showToast, theme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('appearance')
  const promptFileInputRef = useRef(null)
  const skillFileInputRef = useRef(null)

  const promptsQuery = usePromptsQuery()
  const skillsQuery = useSkillsQuery()
  const categoriesQuery = useCategoriesQuery()
  const importPrompts = useImportPrompts()
  const importSkills = useImportSkills()
  const { tools } = useAiTools()

  const prompts = promptsQuery.data ?? []
  const skills = skillsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  async function handleExportPrompts() {
    const json = await exportPromptsAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('ส่งออกไฟล์พรอมต์แล้ว')
  }

  async function handleExportSkills() {
    const json = await exportSkillsAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skills-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('ส่งออกไฟล์สกิลแล้ว')
  }

  async function handleImportPromptsFile(file) {
    try {
      const text = await file.text()
      const imported = await importPrompts.mutateAsync(text)
      showToast(`นำเข้า ${imported.length} พรอมต์สำเร็จ`)
    } catch (err) {
      showToast(err.message ?? 'นำเข้าไฟล์ไม่สำเร็จ')
    }
  }

  async function handleImportSkillsFile(file) {
    try {
      const text = await file.text()
      const imported = await importSkills.mutateAsync(text)
      showToast(`นำเข้า ${imported.length} สกิลสำเร็จ`)
    } catch (err) {
      showToast(err.message ?? 'นำเข้าไฟล์ไม่สำเร็จ')
    }
  }

  function handleClearOfflineCache() {
    if (window.confirm('ต้องการล้างแคชออฟไลน์และรีโหลดข้อมูลใหม่หรือไม่?')) {
      try {
        localStorage.removeItem('prompt_library_cache')
        window.location.reload()
      } catch {
        showToast('ล้างแคชไม่สำเร็จ')
      }
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Hidden File Inputs */}
      <input
        ref={promptFileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportPromptsFile(file)
          e.target.value = ''
        }}
      />
      <input
        ref={skillFileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportSkillsFile(file)
          e.target.value = ''
        }}
      />

      {/* Top Header Card */}
      <div className="settings-card !p-5 sm:!p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow font-mono">PREFERENCES & CONFIG</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
              <Sparkles size={11} /> Control Center
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">การตั้งค่าระบบ</h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1">
            ปรับแต่งลักษณะการแสดงผล จัดการเครื่องมือ AI หมวดหมู่ และสำรองข้อมูล
          </p>
        </div>

        {/* Quick System Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)] text-center">
            <span className="font-mono text-xs font-bold text-[var(--ink)] block">{prompts.length}</span>
            <span className="text-[10px] text-[var(--ink-soft)]">พรอมต์</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)] text-center">
            <span className="font-mono text-xs font-bold text-[var(--ink)] block">{skills.length}</span>
            <span className="text-[10px] text-[var(--ink-soft)]">สกิล</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)] text-center">
            <span className="font-mono text-xs font-bold text-[var(--ink)] block">{categories.length}</span>
            <span className="text-[10px] text-[var(--ink-soft)]">หมวดหมู่</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)] text-center">
            <span className="font-mono text-xs font-bold text-[var(--accent)] block">{tools.length}</span>
            <span className="text-[10px] text-[var(--ink-soft)]">AI Tools</span>
          </div>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 pb-1 border-b border-[var(--glass-line)] overflow-x-auto no-scrollbar flex-nowrap">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`chip-filter !font-medium shrink-0 flex items-center gap-1.5 ${
                isActive ? 'chip-filter-active' : ''
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Appearance & Theme */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-4">
          <ThemeSwitcher theme={theme} onChange={onThemeChange} />

          <div className="settings-card flex flex-col gap-3">
            <h3 className="font-display text-base font-semibold">การจัดรูปแบบตัวอักษร</h3>
            <p className="text-xs text-[var(--ink-soft)]">
              เนื้อหาพรอมต์และโค้ดจะถูกเรนเดอร์ด้วยแบบอักษร <span className="font-mono font-bold">IBM Plex Mono</span> เพื่อความคมชัดและความแม่นยำในการอ่าน
            </p>
            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--glass-line)] font-mono text-xs text-[var(--ink-soft)]">
              &lt;PromptEngine version=&quot;2.1&quot; syntax=&quot;thai-english&quot; /&gt;
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Tools Management */}
      {activeTab === 'aitools' && <AiToolsManager showToast={showToast} />}

      {/* Tab 3: Categories Management */}
      {activeTab === 'categories' && <CategoryManager showToast={showToast} />}

      {/* Tab 4: Data & Backup */}
      {activeTab === 'data' && (
        <div className="flex flex-col gap-4">
          {/* Cloud Database Connection Card */}
          <div className="settings-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[var(--accent)]" />
                <h3 className="font-display text-base font-semibold">ฐานข้อมูล Supabase</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> เชื่อมต่อแล้ว
              </span>
            </div>
            <p className="text-xs text-[var(--ink-soft)]">
              ข้อมูลทั้งหมดถูกซิงก์แบบเรียลไทม์กับเซิร์ฟเวอร์คลาวด์ พร้อมระบบแคชในเครื่องเพื่อให้เปิดอ่านได้แม้ขณะออฟไลน์
            </p>
          </div>

          {/* Backup & Export / Import Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Prompts Export/Import */}
            <div className="settings-card flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-display text-sm font-bold text-[var(--ink)]">คลังพรอมต์ (Prompts)</h4>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  ปัจจุบันมี {prompts.length} พรอมต์ สามารถสำรองเป็นไฟล์ JSON หรือกู้คืนจากไฟล์ภายนอก
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm flex-1" onClick={handleExportPrompts}>
                  <Download size={13} strokeWidth={1.8} /> ส่งออก JSON
                </button>
                <button
                  className="btn btn-sm flex-1"
                  onClick={() => promptFileInputRef.current?.click()}
                  disabled={importPrompts.isPending}
                >
                  <Upload size={13} strokeWidth={1.8} /> นำเข้า JSON
                </button>
              </div>
            </div>

            {/* Skills Export/Import */}
            <div className="settings-card flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-display text-sm font-bold text-[var(--ink)]">คลังสกิล (Skills)</h4>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  ปัจจุบันมี {skills.length} สกิล พร้อมข้อมูล AI Tools ที่ระบุไว้ สามารถสำรองเป็น JSON ได้
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm flex-1" onClick={handleExportSkills}>
                  <Download size={13} strokeWidth={1.8} /> ส่งออก JSON
                </button>
                <button
                  className="btn btn-sm flex-1"
                  onClick={() => skillFileInputRef.current?.click()}
                  disabled={importSkills.isPending}
                >
                  <Upload size={13} strokeWidth={1.8} /> นำเข้า JSON
                </button>
              </div>
            </div>
          </div>

          {/* Local Cache Management */}
          <div className="settings-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                <HardDrive size={15} /> แคชออฟไลน์และพื้นที่หน่วยความจำ
              </h4>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                หากพบปัญหาข้อมูลไม่ตรงกับคลาวด์ สามารถล้างแคชในเบราว์เซอร์เพื่อดึงข้อมูลใหม่
              </p>
            </div>
            <button className="btn btn-sm btn-stamp shrink-0" onClick={handleClearOfflineCache}>
              <Trash2 size={13} /> ล้างแคชในเครื่อง
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Keyboard Shortcuts & System Info */}
      {activeTab === 'about' && (
        <div className="flex flex-col gap-4">
          {/* Keyboard Shortcuts */}
          <div className="settings-card flex flex-col gap-3">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Keyboard size={16} className="text-[var(--accent)]" />
              ปุ่มลัดแป้นพิมพ์ (Keyboard Shortcuts)
            </h3>
            <div className="flex flex-col divide-y divide-[var(--glass-line)] text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-[var(--ink-soft)]">ค้นหาพรอมต์ในคลัง</span>
                <kbd className="font-mono px-2 py-0.5 rounded border border-[var(--glass-line)] bg-black/[0.04]">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[var(--ink-soft)]">เปิดหน้าต่างสร้างพรอมต์ใหม่</span>
                <kbd className="font-mono px-2 py-0.5 rounded border border-[var(--glass-line)] bg-black/[0.04]">
                  N
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[var(--ink-soft)]">ปิดหน้าต่างป๊อปอัป / ยกเลิก</span>
                <kbd className="font-mono px-2 py-0.5 rounded border border-[var(--glass-line)] bg-black/[0.04]">
                  Esc
                </kbd>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="settings-card flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold">เกี่ยวกับ Prompt Library</h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Prompt Library v2.1 — ออกแบบด้วยแนวคิด Craftsmanship & Modern UX/UI เพื่อการจัดเก็บ พัฒนา และเรียกใช้ชุดคำสั่ง AI อย่างมืออาชีพ
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--glass-line)] text-[11px] text-[var(--ink-soft)] font-mono">
              <span>Stack: React 19</span>
              <span>•</span>
              <span>Vite</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
