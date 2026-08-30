import { supabase } from './supabase'

const IMAGE_BUCKET = 'prompt-images'

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*, category:categories(id, name, color)')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

// Soft-deleted prompts — powers the Trash view so accidental (or bad-faith,
// since there's no login) deletes are always recoverable.
export async function fetchDeletedPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*, category:categories(id, name, color)')
    .eq('is_deleted', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCategory({ name, color }) {
  const { data, error } = await supabase.from('categories').insert({ name, color }).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, fields) {
  const { data, error } = await supabase.from('categories').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Prompts referencing this category have category_id set to NULL automatically
// (schema uses "on delete set null"), so this never orphans or breaks a prompt —
// it just un-categorizes it.
export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function fetchVersions(promptId) {
  const { data, error } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('prompt_id', promptId)
    .order('version', { ascending: false })

  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createPrompt({ title, content, category_id, tags = [], image_url = null }) {
  const { data, error } = await supabase
    .from('prompts')
    .insert({ title, content, category_id, tags, image_url })
    .select()
    .single()

  if (error) throw error
  return data
}

// Editing title/content auto-snapshots the previous version (DB trigger).
export async function updatePrompt(id, fields) {
  const { data, error } = await supabase
    .from('prompts')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleFavorite(id, is_favorite) {
  return updatePrompt(id, { is_favorite })
}

export async function togglePin(id, is_pinned) {
  return updatePrompt(id, { is_pinned })
}

// Soft delete — keeps the row (and its version history) recoverable since
// there's no login/ownership to guard against accidental or bad-faith deletes.
export async function deletePrompt(id) {
  return updatePrompt(id, { is_deleted: true })
}

export async function restorePrompt(id) {
  return updatePrompt(id, { is_deleted: false })
}

// Roll back to a prior version's text (creates a new version snapshot too,
// since it goes through the normal update path).
export async function restoreVersion(promptId, version) {
  const { data: versionRow, error: vErr } = await supabase
    .from('prompt_versions')
    .select('title, content, tags')
    .eq('prompt_id', promptId)
    .eq('version', version)
    .single()

  if (vErr) throw vErr
  return updatePrompt(promptId, {
    title: versionRow.title,
    content: versionRow.content,
    tags: versionRow.tags,
  })
}

// ---------------------------------------------------------------------------
// Preview images (e.g. sample output for an image-generation prompt)
//
// Stored in a public Supabase Storage bucket rather than as base64 in the
// row — keeps the prompts table lightweight and lets the browser cache/CDN
// the image normally. See supabase/migration_002_images.sql for the bucket
// + policy setup this depends on.
// ---------------------------------------------------------------------------

export async function uploadPromptImage(file) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Best-effort cleanup — never blocks the calling UI action on failure.
export async function deletePromptImage(url) {
  if (!url) return
  try {
    const path = url.split(`/${IMAGE_BUCKET}/`).pop()
    if (path) await supabase.storage.from(IMAGE_BUCKET).remove([path])
  } catch {
    // non-fatal: an orphaned file in storage is harmless
  }
}

// ---------------------------------------------------------------------------
// Export / Import (JSON)
// ---------------------------------------------------------------------------

export async function exportPromptsAsJson() {
  const prompts = await fetchPrompts()
  const payload = {
    exported_at: new Date().toISOString(),
    version: 1,
    prompts: prompts.map((p) => ({
      title: p.title,
      content: p.content,
      tags: p.tags,
      category: p.category?.name ?? null,
      is_favorite: p.is_favorite,
      is_pinned: p.is_pinned,
    })),
  }
  return JSON.stringify(payload, null, 2)
}

// Accepts the JSON shape produced by exportPromptsAsJson (or a bare array of
// the same prompt objects). Resolves categories by name, creating them if
// they don't exist yet, then bulk-inserts prompts.
export async function importPromptsFromJson(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json
  const incoming = Array.isArray(parsed) ? parsed : parsed.prompts
  if (!Array.isArray(incoming)) throw new Error('Invalid import file: expected a "prompts" array.')

  const categories = await fetchCategories()
  const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]))

  const rows = []
  for (const item of incoming) {
    let category_id = null
    if (item.category) {
      const key = String(item.category).toLowerCase()
      if (byName.has(key)) {
        category_id = byName.get(key)
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: item.category })
          .select()
          .single()
        if (error) throw error
        byName.set(key, data.id)
        category_id = data.id
      }
    }

    rows.push({
      title: item.title,
      content: item.content,
      tags: item.tags ?? [],
      category_id,
      is_favorite: Boolean(item.is_favorite),
      is_pinned: Boolean(item.is_pinned),
    })
  }

  const { data, error } = await supabase.from('prompts').insert(rows).select()
  if (error) throw error
  return data
}
