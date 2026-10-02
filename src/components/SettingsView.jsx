import { useState } from 'react'
import CategoryManager from './CategoryManager'
import ThemeSwitcher from './ThemeSwitcher'

export default function SettingsView({ showToast, theme, onThemeChange }) {
  const [section, setSection] = useState(null) // null | 'categories' | 'aitools'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="eyebrow font-mono">SETTINGS</span>
        <h2 className="font-display text-2xl font-medium mt-3">ตั้งค่า</h2>
      </div>

      <ThemeSwitcher theme={theme} onChange={onThemeChange} />

      {/* Categories + AI Tools side-by-side buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="settings-section-btn"
          onClick={() => setSection(section === 'categories' ? null : 'categories')}
        >
          <div className="btn-icon-wrap">🗂</div>
          <span className="font-display text-base font-semibold">หมวดหมู่</span>
          <span className="text-xs text-[var(--ink-soft)]">จัดกลุ่มพรอมต์ของคุณ</span>
        </button>

        <button
          className="settings-section-btn"
          onClick={() => setSection(section === 'aitools' ? null : 'aitools')}
        >
          <div className="btn-icon-wrap">🤖</div>
          <span className="font-display text-base font-semibold">AI Tools</span>
          <span className="text-xs text-[var(--ink-soft)]">เชื่อมต่อเครื่องมือ AI</span>
        </button>
      </div>

      {section === 'categories' && (
        <CategoryManager showToast={showToast} />
      )}

      {section === 'aitools' && (
        <div className="settings-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">AI Tools</h3>
            <span className="text-xs text-[var(--ink-soft)]">เร็วๆ นี้</span>
          </div>
          <div className="settings-card settings-card-muted text-center py-8">
            <p className="text-2xl mb-2">🤖</p>
            <p className="text-sm text-[var(--ink-soft)]">
              การจัดการ AI Tools (เช่น GPT, Gemini, Claude) จะพร้อมใช้งานเร็วๆ นี้
            </p>
          </div>
        </div>
      )}

      <div className="settings-card settings-card-muted">
        <h3 className="font-display text-lg font-semibold mb-1">การตั้งค่าอื่นๆ</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          กำลังจะมาเร็วๆ นี้ — เช่น การจัดการสิทธิ์การแชร์ สีเน้น (accent) ที่ปรับเองได้ และการแจ้งเตือน
        </p>
      </div>
    </div>
  )
}
