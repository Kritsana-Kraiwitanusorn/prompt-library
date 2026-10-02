import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/skills'

const SKILLS_KEY = ['skills']
const DELETED_SKILLS_KEY = ['skills', 'deleted']

export function useSkillsQuery() {
  return useQuery({ queryKey: SKILLS_KEY, queryFn: api.fetchSkills })
}

export function useDeletedSkillsQuery() {
  return useQuery({ queryKey: DELETED_SKILLS_KEY, queryFn: api.fetchDeletedSkills })
}

function useSkillsMutation(mutationFn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SKILLS_KEY })
      qc.invalidateQueries({ queryKey: DELETED_SKILLS_KEY })
    },
  })
}

export function useCreateSkill() {
  return useSkillsMutation(api.createSkill)
}

export function useUpdateSkill() {
  return useSkillsMutation(({ id, fields }) => api.updateSkill(id, fields))
}

export function useDeleteSkill() {
  return useSkillsMutation(api.deleteSkill)
}

export function useRestoreSkill() {
  return useSkillsMutation(api.restoreSkill)
}

export function useHardDeleteSkill() {
  return useSkillsMutation(api.hardDeleteSkill)
}

export function useImportSkills() {
  return useSkillsMutation(api.importSkillsFromJson)
}
