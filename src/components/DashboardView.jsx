import { useMemo } from 'react'
import { STATUS_OPTIONS } from '../lib/constants'
import { useSkillsQuery } from '../hooks/useSkills'
import { extractVariables } from '../lib/variables'
import {
  Sparkles,
  Layers,
  GraduationCap,
  Copy,
  Star,
  Pin,
  CheckCircle2,
  TrendingUp,
  Tag,
  BarChart3,
  Award,
  Zap,
} from 'lucide-react'

export default function DashboardView({ prompts, categories }) {
  const skillsQuery = useSkillsQuery()
  const skills = skillsQuery.data ?? []

  const stats = useMemo(() => {
    const total = prompts.length
    const favorites = prompts.filter((p) => p.is_favorite).length
    const pinned = prompts.filter((p) => p.is_pinned).length
    const withImage = prompts.filter((p) => p.image_url).length
    const withVariables = prompts.filter((p) => extractVariables(p.content).length > 0).length
    const withTags = prompts.filter((p) => (p.tags ?? []).length > 0).length
    const categorized = prompts.filter((p) => p.category_id).length

    const totalCopies = prompts.reduce((sum, p) => sum + (p.copy_count ?? 0), 0)

    const statusCounts = STATUS_OPTIONS.map((s) => ({
      ...s,
      count: prompts.filter((p) => (p.status ?? 'draft') === s.value).length,
    }))

    const productionCount = prompts.filter((p) => p.status === 'production').length
    const productionPercent = total > 0 ? Math.round((productionCount / total) * 100) : 0

    const categoryCounts = (categories ?? [])
      .map((c) => ({
        ...c,
        count: prompts.filter((p) => p.category_id === c.id).length,
      }))
      .concat([
        {
          id: null,
          name: 'ไม่ระบุหมวดหมู่',
          color: '#9A9A93',
          count: prompts.filter((p) => !p.category_id).length,
        },
      ])
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    const maxCategoryCount = Math.max(1, ...categoryCounts.map((c) => c.count))

    const mostCopied = [...prompts]
      .filter((p) => (p.copy_count ?? 0) > 0)
      .sort((a, b) => (b.copy_count ?? 0) - (a.copy_count ?? 0))
      .slice(0, 5)

    // Health Score calculation (0-100)
    const categorizedScore = total > 0 ? (categorized / total) * 35 : 0
    const taggedScore = total > 0 ? (withTags / total) * 35 : 0
    const productionScore = total > 0 ? (productionCount / total) * 30 : 0
    const healthScore = Math.round(categorizedScore + taggedScore + productionScore)

    return {
      total,
      favorites,
      pinned,
      withImage,
      withVariables,
      withTags,
      categorized,
      totalCopies,
      productionCount,
      productionPercent,
      statusCounts,
      categoryCounts,
      maxCategoryCount,
      mostCopied,
      healthScore,
    }
  }, [prompts, categories])

  // Skills breakdown
  const skillsStats = useMemo(() => {
    const map = {}
    const tagSet = new Set()
    skills.forEach((s) => {
      const key = s.category?.trim() || 'ทั่วไป'
      map[key] = (map[key] || 0) + 1
      ;(s.tags ?? []).forEach((t) => tagSet.add(t))
    })

    const categoriesList = Object.entries(map).sort((a, b) => b[1] - a[1])
    return {
      categoriesList,
      totalCategories: categoriesList.length,
      uniqueTagsCount: tagSet.size,
      topTags: [...tagSet].slice(0, 6),
    }
  }, [skills])

  async function handleQuickCopy(text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Executive Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-[var(--glass-line)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow font-mono">EXECUTIVE DASHBOARD</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Live Ecosystem
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">ภาพรวมคลังระบบ</h2>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Prompts */}
        <div className="stat-card stat-card-accent relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] font-medium">
            <span>พรอมต์ทั้งหมด</span>
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Layers size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{stats.total}</span>
            <span className="text-xs text-[var(--ink-soft)] font-medium">รายการ</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-soft)] mt-2">
            <CheckCircle2 size={13} className="text-[var(--accent)]" />
            <span>พร้อมใช้งานจริง {stats.productionCount} ({stats.productionPercent}%)</span>
          </div>
        </div>

        {/* Card 2: Total Skills */}
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] font-medium">
            <span>คลังสกิลอ้างอิง</span>
            <div className="w-7 h-7 rounded-lg bg-black/[0.04] text-[var(--ink)] flex items-center justify-center">
              <GraduationCap size={15} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{skills.length}</span>
            <span className="text-xs text-[var(--ink-soft)] font-medium">สกิล</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-soft)] mt-2">
            <Tag size={12} />
            <span>ครอบคลุม {skillsStats.totalCategories} หมวดหมู่</span>
          </div>
        </div>

        {/* Card 3: Total Copies */}
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] font-medium">
            <span>สถิติคัดลอกรวม</span>
            <div className="w-7 h-7 rounded-lg bg-black/[0.04] text-[var(--ink)] flex items-center justify-center">
              <Zap size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{stats.totalCopies}</span>
            <span className="text-xs text-[var(--ink-soft)] font-medium">ครั้ง</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-soft)] mt-2">
            <TrendingUp size={13} className="text-[var(--accent)]" />
            <span>
              เฉลี่ย {stats.total > 0 ? (stats.totalCopies / stats.total).toFixed(1) : 0} ครั้ง/พรอมต์
            </span>
          </div>
        </div>

        {/* Card 4: Pinned & Favorites */}
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] font-medium">
            <span>สินทรัพย์สำคัญ</span>
            <div className="w-7 h-7 rounded-lg bg-black/[0.04] text-[var(--ink)] flex items-center justify-center">
              <Award size={14} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
              {stats.pinned + stats.favorites}
            </span>
            <span className="text-xs text-[var(--ink-soft)] font-medium">รายการ</span>
          </div>
          <div className="flex items-center gap-2 text-[11.5px] text-[var(--ink-soft)] mt-2 font-medium">
            <span className="inline-flex items-center gap-0.5 text-[var(--accent)]">
              <Pin size={11} fill="currentColor" /> {stats.pinned} ปักหมุด
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5 text-[var(--ink)]">
              <Star size={11} fill="currentColor" /> {stats.favorites} โปรด
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Status Pipeline */}
      <div className="settings-card !p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base font-semibold">วงจรชีวิตสถานะพรอมต์</h3>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--ink-soft)]">
            รวม {stats.total} รายการ
          </span>
        </div>

        {/* Segmented Pipeline Bar */}
        <div className="h-3 rounded-full bg-black/[0.06] overflow-hidden flex mb-4">
          {stats.statusCounts.map((s) => {
            const pct = stats.total > 0 ? (s.count / stats.total) * 100 : 0
            if (pct === 0) return null
            let bg = 'var(--ink-soft)'
            if (s.value === 'production') bg = '#1A1A1A'
            if (s.value === 'review') bg = 'var(--accent)'
            if (s.value === 'draft') bg = 'rgba(0,0,0,0.22)'
            if (s.value === 'archived') bg = 'rgba(0,0,0,0.1)'

            return (
              <div
                key={s.value}
                className="h-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: bg }}
                title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
              />
            )
          })}
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.statusCounts.map((s) => {
            const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0
            return (
              <div
                key={s.value}
                className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] border border-[var(--glass-line)]"
              >
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${s.badgeClass} !py-0.5 !px-2 text-[10px]`}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-bold text-[var(--ink)]">{s.count}</span>
                  <span className="text-[10px] text-[var(--ink-soft)] font-mono">({pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two-Column Mid Section: Category Breakdown + Skills Repository Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories Distribution */}
        <div className="settings-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--glass-line)]">
              <div>
                <h3 className="font-display text-base font-semibold">การกระจายตามหมวดหมู่</h3>
              </div>
              <span className="text-xs font-mono text-[var(--ink-soft)]">
                {stats.categoryCounts.length} หมวดหมู่
              </span>
            </div>

            {stats.categoryCounts.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)] py-8 text-center">ยังไม่มีข้อมูลในคลัง</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.categoryCounts.slice(0, 6).map((c) => {
                  const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0
                  return (
                    <div key={c.id ?? 'none'} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="swatch-dot shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="font-medium truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-soft)] shrink-0">
                          <span className="font-semibold text-[var(--ink)]">{c.count}</span>
                          <span>({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${(c.count / stats.maxCategoryCount) * 100}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Skills Knowledge Summary (Completely Redesigned) */}
        <div className="settings-card flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4 pb-2 border-b border-[var(--glass-line)]">
              <div>
                <h3 className="font-display text-base font-semibold">สรุปคลังสกิล</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-xs font-bold">
                <GraduationCap size={13} />
                <span>{skills.length} สกิล</span>
              </div>
            </div>

            {skills.length === 0 && (
              <div className="text-center py-8">
                <p className="text-2xl mb-1">🎓</p>
                <p className="text-sm text-[var(--ink-soft)]">ยังไม่มีสกิลในระบบ</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="flex flex-col gap-3.5">
                {/* 2-pill micro stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)]">
                    <span className="text-[11px] text-[var(--ink-soft)] block">หมวดหมู่สกิล</span>
                    <span className="font-display text-lg font-bold text-[var(--ink)]">
                      {skillsStats.totalCategories}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.03] border border-[var(--glass-line)]">
                    <span className="text-[11px] text-[var(--ink-soft)] block">แท็กเฉพาะ</span>
                    <span className="font-display text-lg font-bold text-[var(--ink)]">
                      {skillsStats.uniqueTagsCount}
                    </span>
                  </div>
                </div>

                {/* Skills Category Bars */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[var(--ink-soft)]">สัดส่วนตามหมวดหมู่:</span>
                  {skillsStats.categoriesList.slice(0, 4).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-2.5 text-xs">
                      <span className="w-24 truncate font-medium text-[var(--ink)]">{cat}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] opacity-80"
                          style={{ width: `${(count / skills.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[var(--ink-soft)] w-6 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tags Cloud Preview */}
                {skillsStats.topTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--glass-line)]">
                    {skillsStats.topTags.map((t) => (
                      <span key={t} className="tag !my-0 text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Performing Prompts + Library Health Index */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performing Prompts Leaderboard */}
        <div className="settings-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--glass-line)]">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[var(--accent)]" />
                <h3 className="font-display text-base font-semibold">พรอมต์ที่ใช้งานบ่อยที่สุด</h3>
              </div>
              <span className="text-xs font-mono text-[var(--ink-soft)]">Top 5</span>
            </div>

            {stats.mostCopied.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)] py-8 text-center">
                ยังไม่มีการคัดลอกพรอมต์ในระบบ
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {stats.mostCopied.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/[0.02] border border-[var(--glass-line)] hover:bg-black/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                          i === 0
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-black/[0.08] text-[var(--ink)]'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-[var(--ink)]">{p.title}</p>
                        {p.category && (
                          <span className="text-[10px] text-[var(--ink-soft)]">{p.category.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-semibold text-[var(--accent)] px-2 py-0.5 rounded-md bg-[var(--accent-soft)]">
                        {p.copy_count}× คัดลอก
                      </span>
                      <button
                        className="btn-icon !w-7 !h-7"
                        title="คัดลอกข้อความ"
                        onClick={() => handleQuickCopy(p.content)}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quality & Health Index */}
        <div className="settings-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--glass-line)]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent)]" />
                <h3 className="font-display text-base font-semibold">ดัชนีคุณภาพและความสมบูรณ์</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                {stats.healthScore}% Readiness
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-black/[0.02] border border-[var(--glass-line)]">
                <span className="text-xs text-[var(--ink-soft)] block mb-1">เทมเพลตตัวแปร</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg font-bold text-[var(--ink)]">
                    {stats.withVariables}
                  </span>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    / {stats.total}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--ink-soft)] mt-1 block">
                  รองรับช่องกรอกตัวแปร
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-[var(--glass-line)]">
                <span className="text-xs text-[var(--ink-soft)] block mb-1">รูปภาพตัวอย่าง</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg font-bold text-[var(--ink)]">
                    {stats.withImage}
                  </span>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    / {stats.total}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--ink-soft)] mt-1 block">
                  มีรูปผลลัพธ์แนบไว้
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-[var(--glass-line)]">
                <span className="text-xs text-[var(--ink-soft)] block mb-1">การจัดหมวดหมู่</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg font-bold text-[var(--ink)]">
                    {stats.categorized}
                  </span>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    / {stats.total}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--ink-soft)] mt-1 block">
                  {stats.total > 0 ? Math.round((stats.categorized / stats.total) * 100) : 0}% จัดกลุ่มแล้ว
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-[var(--glass-line)]">
                <span className="text-xs text-[var(--ink-soft)] block mb-1">การติดแท็กค้นหา</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg font-bold text-[var(--ink)]">
                    {stats.withTags}
                  </span>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    / {stats.total}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--ink-soft)] mt-1 block">
                  {stats.total > 0 ? Math.round((stats.withTags / stats.total) * 100) : 0}% ติดแท็กแล้ว
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
