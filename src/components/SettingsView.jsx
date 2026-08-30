import CategoryManager from './CategoryManager'
import ThemeSwitcher from './ThemeSwitcher'

export default function SettingsView({ showToast, theme, onThemeChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="eyebrow font-mono">SETTINGS</span>
        <h2 className="font-display text-2xl font-medium mt-3">ตั้งค่า</h2>
        <p className="text-sm text-[var(--ink-soft)] mt-1">จัดการคลังของคุณ — เพิ่มเติมได้เรื่อยๆ ในอนาคต</p>
      </div>

      <ThemeSwitcher theme={theme} onChange={onThemeChange} />

      <CategoryManager showToast={showToast} />

      <div className="settings-card settings-card-muted">
        <h3 className="font-display text-lg font-semibold mb-1">การตั้งค่าอื่นๆ</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          กำลังจะมาเร็วๆ นี้ — เช่น การจัดการสิทธิ์การแชร์ สีเน้น (accent) ที่ปรับเองได้ และการแจ้งเตือน
        </p>
      </div>
    </div>
  )
}
