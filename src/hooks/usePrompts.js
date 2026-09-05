import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/prompts'

const PROMPTS_KEY = ['prompts']
const CATEGORIES_KEY = ['categories']
const DELETED_KEY = ['prompts', 'deleted']

export function usePromptsQuery() {
  return useQuery({ queryKey: PROMPTS_KEY, queryFn: api.fetchPrompts })
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: api.fetchCategories })
}

export function useDeletedPromptsQuery(enabled = true) {
  return useQuery({ queryKey: DELETED_KEY, queryFn: api.fetchDeletedPrompts, enabled })
}

export function useVersionsQuery(promptId, enabled) {
  return useQuery({
    queryKey: ['versions', promptId],
    queryFn: () => api.fetchVersions(promptId),
    enabled: Boolean(promptId) && enabled,
  })
}

// ---------------------------------------------------------------------------
// Optimistic mutation helper
//
// Every write below follows the same shape: snapshot the current cache,
// apply an immediate local change so the UI reacts instantly, roll back on
// error, and reconcile with the server's version on settle (this is what
// picks up server-computed fields like current_version bumps from the DB
// trigger, so the optimistic guess never has to be perfectly accurate).
// `extraInvalidateKeys` lets a mutation also refresh a second cache (e.g.
// deleting a prompt should also refresh the Trash list) without needing a
// bespoke wrapper per mutation.
// ---------------------------------------------------------------------------
function useOptimisticPromptsMutation(mutationFn, applyOptimistic, extraInvalidateKeys = []) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: PROMPTS_KEY })
      const previous = qc.getQueryData(PROMPTS_KEY)
      if (previous) {
        qc.setQueryData(PROMPTS_KEY, applyOptimistic(previous, variables, qc))
      }
      return { previous }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) qc.setQueryData(PROMPTS_KEY, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROMPTS_KEY })
      extraInvalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }))
    },
  })
}

export function useCreatePrompt() {
  return useOptimisticPromptsMutation(api.createPrompt, (prompts, fields, qc) => {
    const categories = qc.getQueryData(CATEGORIES_KEY) ?? []
    const category = categories.find((c) => c.id === fields.category_id) ?? null
    const optimisticPrompt = {
      id: `temp-${Date.now()}`,
      title: fields.title,
      content: fields.content,
      category_id: fields.category_id ?? null,
      category,
      tags: fields.tags ?? [],
      image_url: fields.image_url ?? null,
      status: fields.status ?? 'draft',
      is_favorite: false,
      is_pinned: false,
      current_version: 1,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _optimistic: true,
    }
    return [optimisticPrompt, ...prompts]
  })
}

export function useUpdatePrompt() {
  return useOptimisticPromptsMutation(
    ({ id, fields }) => api.updatePrompt(id, fields),
    (prompts, { id, fields }) =>
      prompts.map((p) => (p.id === id ? { ...p, ...fields, updated_at: new Date().toISOString() } : p)),
  )
}

export function useToggleFavorite() {
  return useOptimisticPromptsMutation(
    ({ id, value }) => api.toggleFavorite(id, value),
    (prompts, { id, value }) => prompts.map((p) => (p.id === id ? { ...p, is_favorite: value } : p)),
  )
}

export function useTogglePin() {
  return useOptimisticPromptsMutation(
    ({ id, value }) => api.togglePin(id, value),
    (prompts, { id, value }) => prompts.map((p) => (p.id === id ? { ...p, is_pinned: value } : p)),
  )
}

// Soft delete — also refreshes the Trash list so the item shows up there
// immediately instead of only appearing after its own next fetch.
export function useDeletePrompt() {
  return useOptimisticPromptsMutation(
    api.deletePrompt,
    (prompts, id) => prompts.filter((p) => p.id !== id),
    [DELETED_KEY],
  )
}

// Restore/hard-delete operate on the Trash list, not the main prompts
// cache, so they get their own small optimistic pattern rather than reusing
// the helper above.
export function useRestorePrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prompt) => api.restorePrompt(prompt.id),
    onMutate: async (prompt) => {
      await qc.cancelQueries({ queryKey: DELETED_KEY })
      const previousDeleted = qc.getQueryData(DELETED_KEY)
      if (previousDeleted) {
        qc.setQueryData(DELETED_KEY, previousDeleted.filter((p) => p.id !== prompt.id))
      }
      return { previousDeleted }
    },
    onError: (_err, _prompt, context) => {
      if (context?.previousDeleted) qc.setQueryData(DELETED_KEY, context.previousDeleted)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROMPTS_KEY })
      qc.invalidateQueries({ queryKey: DELETED_KEY })
    },
  })
}

// Permanent delete from Trash — irreversible, so this is only ever wired up
// behind an explicit confirm dialog in the UI.
export function useHardDeletePrompt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prompt) => api.hardDeletePrompt(prompt.id, prompt.image_url),
    onMutate: async (prompt) => {
      await qc.cancelQueries({ queryKey: DELETED_KEY })
      const previousDeleted = qc.getQueryData(DELETED_KEY)
      if (previousDeleted) {
        qc.setQueryData(DELETED_KEY, previousDeleted.filter((p) => p.id !== prompt.id))
      }
      return { previousDeleted }
    },
    onError: (_err, _prompt, context) => {
      if (context?.previousDeleted) qc.setQueryData(DELETED_KEY, context.previousDeleted)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: DELETED_KEY }),
  })
}

export function useRestoreVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ promptId, version }) => api.restoreVersion(promptId, version),
    onSuccess: (_, { promptId }) => {
      qc.invalidateQueries({ queryKey: PROMPTS_KEY })
      qc.invalidateQueries({ queryKey: ['versions', promptId] })
    },
  })
}

export function useImportPrompts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.importPromptsFromJson,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMPTS_KEY }),
  })
}

// ---------------------------------------------------------------------------
// Category management (Settings)
//
// Kept as plain (non-optimistic) mutations: category edits are infrequent
// admin actions, not the rapid-fire interactions favorite/pin are, so the
// extra complexity of an optimistic rollback isn't worth it here. Both
// caches are invalidated because each prompt carries an embedded
// `category` object (name + color) that would otherwise go stale.
// ---------------------------------------------------------------------------
function useCategoryMutation(mutationFn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      qc.invalidateQueries({ queryKey: PROMPTS_KEY })
    },
  })
}

export function useCreateCategory() {
  return useCategoryMutation(api.createCategory)
}

export function useUpdateCategory() {
  return useCategoryMutation(({ id, fields }) => api.updateCategory(id, fields))
}

export function useDeleteCategory() {
  return useCategoryMutation(api.deleteCategory)
}
