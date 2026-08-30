export default function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="settings-card">
      <h3 className="font-display text-lg font-semibold mb-1">ธีมสี</h3>
      <p className="text-sm text-[var(--ink-soft)] mb-4">เลือกโหมดสว่างหรือมืด บันทึกไว้ในเครื่องนี้</p>
      <div className="nav-tabs inline-flex">
        <button className={`nav-tab${theme === 'light' ? ' nav-tab-active' : ''}`} onClick={() => onChange('light')}>
          ☀️ สว่าง
        </button>
        <button className={`nav-tab${theme === 'dark' ? ' nav-tab-active' : ''}`} onClick={() => onChange('dark')}>
          🌙 มืด
        </button>
      </div>
    </div>
  )
}
