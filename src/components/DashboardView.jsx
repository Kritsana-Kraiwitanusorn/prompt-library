import { useMemo } from 'react'
import { STATUS_OPTIONS } from '../lib/constants'

export default function DashboardView({ prompts, categories }) {
  const stats = useMemo(() => {
    const total = prompts.length
    const favorites = prompts.filter((p) => p.is_favorite).length
    const pinned = prompts.filter((p) => p.is_pinned).length
    const withImage = prompts.filter((p) => p.image_url).length

    const statusCounts = STATUS_OPTIONS.map((s) => ({
      ...s,
      count: prompts.filter((p) => (p.status ?? 'draft') === s.value).length,
    }))

    const categoryCounts = (categories ?? [])
      .map((c) => ({ ...c, count: prompts.filter((p) => p.category_id === c.id).length }))
      .concat([{ id: null, name: 'ไม่ระบุหมวดหมู่', color: '#9A9A93', count: prompts.filter((p) => !p.category_id).length }])
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    const maxCategoryCount = Math.max(1, ...categoryCounts.map((c) => c.count))

    return { total, favorites, pinned, withImage, statusCounts, categoryCounts, maxCategoryCount }
  }, [prompts, categories])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow font-mono">DASHBOARD</span>
        <h2 className="font-display text-2xl font-medium mt-3">ภาพรวมคลัง</h2>
        <p className="text-sm text-[var(--ink-soft)] mt-1">สรุปจำนวนพรอมต์ สถานะ และหมวดหมู่ทั้งหมด</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="พรอมต์ทั้งหมด" value={stats.total} />
        <StatCard label="รายการโปรด" value={stats.favorites} icon="★" />
        <StatCard label="ปักหมุด" value={stats.pinned} icon="📌" />
        <StatCard label="มีรูปตัวอย่าง" value={stats.withImage} icon="🖼️" />
      </div>

      <div className="settings-card">
        <h3 className="font-display text-lg font-semibold mb-4">แยกตามสถานะ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.statusCounts.map((s) => (
            <div key={s.value} className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.03] px-3 py-2.5">
              <span className={`status-badge ${s.badgeClass}`}>{s.label}</span>
              <span className="font-mono text-sm font-semibold">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <h3 className="font-display text-lg font-semibold mb-4">แยกตามหมวดหมู่</h3>
        {stats.categoryCounts.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">ยังไม่มีพรอมต์ในคลัง</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.categoryCounts.map((c) => (
              <div key={c.id ?? 'none'} className="flex items-center gap-3">
                <span className="swatch-dot shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-sm w-32 shrink-0 truncate">{c.name}</span>
                <div className="flex-1 h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(c.count / stats.maxCategoryCount) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
                <span className="font-mono text-xs text-[var(--ink-soft)] w-6 text-right shrink-0">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="settings-card !p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--ink-soft)]">{label}</span>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <p className="font-display text-2xl font-medium">{value}</p>
    </div>
  )
}
