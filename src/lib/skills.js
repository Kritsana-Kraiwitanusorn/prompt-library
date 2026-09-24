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

// Skills don't have a Trash view of their own (kept simple, unlike
// prompts) — deleting is immediate and permanent, behind a confirm dialog
// in the UI.
export async function deleteSkill(id) {
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw error
}
