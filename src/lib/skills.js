import { supabase } from './supabase'
import { combineTagsWithAiTool, extractAiToolFromSkill } from './aiTools'

export async function fetchSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchDeletedSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_deleted', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createSkill({ title, content, category, tags = [], ai_tool = null }) {
  const finalTags = combineTagsWithAiTool(tags, ai_tool)
  const { data, error } = await supabase
    .from('skills')
    .insert({ title, content, category: category || null, tags: finalTags })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSkill(id, fields) {
  const payload = { ...fields }
  if ('tags' in fields || 'ai_tool' in fields) {
    const existingTags = fields.tags ?? []
    payload.tags = combineTagsWithAiTool(existingTags, fields.ai_tool)
    delete payload.ai_tool
  }
  const { data, error } = await supabase.from('skills').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Soft delete moves the skill to Trash so it can be recovered
export async function deleteSkill(id) {
  const { data, error } = await supabase.from('skills').update({ is_deleted: true }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function restoreSkill(id) {
  const { data, error } = await supabase.from('skills').update({ is_deleted: false }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function hardDeleteSkill(id) {
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
      ai_tool: extractAiToolFromSkill(s),
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
    tags: combineTagsWithAiTool(item.tags ?? [], item.ai_tool),
    category: item.category ?? null,
  }))

  const { data, error } = await supabase.from('skills').insert(rows).select()
  if (error) throw error
  return data
}
