// Status reflects a prompt's lifecycle stage — separate from favorite/pin,
// which reflect importance/frequency of use. Recommended default set:
//   draft      — still being written, not ready to rely on
//   review     — written, waiting for someone to sanity-check it
//   production — the version you actually use/share with others
//   archived   — kept for reference but no longer actively used
export const STATUS_OPTIONS = [
  { value: 'draft', label: 'ฉบับร่าง', badgeClass: 'status-badge-draft' },
  { value: 'review', label: 'รอตรวจสอบ', badgeClass: 'status-badge-review' },
  { value: 'production', label: 'ใช้งานจริง', badgeClass: 'status-badge-production' },
  { value: 'archived', label: 'เก็บถาวร', badgeClass: 'status-badge-archived' },
]

export function getStatusMeta(value) {
  return STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0]
}
