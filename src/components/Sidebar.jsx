const NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', label: 'แดชบอร์ด' },
  { key: 'library', icon: '🗂️', label: 'คลัง' },
  { key: 'favorites', icon: '★', label: 'รายการโปรด' },
  { key: 'trash', icon: '🗑️', label: 'ถังขยะ' },
  { key: 'settings', icon: '⚙️', label: 'ตั้งค่า' },
]

export default function Sidebar({ activeKey, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark font-mono">Pl</div>
        <span className="text-[15px] font-semibold">Prompt Library</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link${activeKey === item.key ? ' sidebar-link-active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
