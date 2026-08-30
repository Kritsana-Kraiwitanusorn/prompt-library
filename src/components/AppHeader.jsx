export default function AppHeader({ view, onViewChange }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="flex items-center gap-2.5">
          <div className="brand-mark font-mono">Pl</div>
          <span className="text-[15px] font-semibold">Prompt Library</span>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab${view === 'library' ? ' nav-tab-active' : ''}`}
            onClick={() => onViewChange('library')}
          >
            คลัง
          </button>
          <button
            className={`nav-tab${view === 'settings' ? ' nav-tab-active' : ''}`}
            onClick={() => onViewChange('settings')}
          >
            ตั้งค่า
          </button>
        </nav>
      </div>
    </header>
  )
}
