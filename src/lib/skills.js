import { supabase } from './supabase'

export async function fetchSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createSkill({ title, content, category, tags = [] }) {
  const { data, error } = await supabase
    .from('skills')
    .insert({ title, content, category: category || null, tags })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSkill(id, fields) {
  const { data, error } = await supabase.from('skills').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Skills don't have a Trash view of their own — deleting is immediate and permanent,
// behind a confirm dialog in the UI.
export async function deleteSkill(id) {
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw error
}

export async function exportSkillsAsJson() {
  const skills = await fetchSkills()
  const payload = {
    exported_at: new Date().toISOString(),
    version: 1,
    skills: skills.map((s) => ({
      title: s.title,
      content: s.content,
      tags: s.tags ?? [],
      category: s.category ?? null,
    })),
  }
  return JSON.stringify(payload, null, 2)
}

export async function importSkillsFromJson(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json
  const incoming = Array.isArray(parsed) ? parsed : parsed.skills
  if (!Array.isArray(incoming)) throw new Error('ไฟล์นำเข้าไม่ถูกต้อง: ไม่พบรายการ "skills"')

  const rows = incoming.map((item) => ({
    title: item.title,
    content: item.content,
    tags: item.tags ?? [],
    category: item.category ?? null,
  }))

  const { data, error } = await supabase.from('skills').insert(rows).select()
  if (error) throw error
  return data
}
