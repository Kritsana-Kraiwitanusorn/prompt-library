import { LayoutGrid, BarChart3, GraduationCap, Trash2, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', icon: BarChart3, label: 'แดชบอร์ด' },
  { key: 'library', icon: LayoutGrid, label: 'คลัง' },
  { key: 'skills', icon: GraduationCap, label: 'สกิล' },
  { key: 'trash', icon: Trash2, label: 'ถังขยะ' },
  { key: 'settings', icon: Settings, label: 'ตั้งค่า' },
]

export default function Sidebar({ activeKey, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark font-mono">Pl</div>
        <span className="text-[15px] font-semibold">Prompt Library</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={`sidebar-link${activeKey === item.key ? ' sidebar-link-active' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              <Icon className="sidebar-icon" strokeWidth={activeKey === item.key ? 2.3 : 1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
