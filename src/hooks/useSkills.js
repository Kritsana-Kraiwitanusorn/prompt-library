import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/skills'

const SKILLS_KEY = ['skills']

export function useSkillsQuery() {
  return useQuery({ queryKey: SKILLS_KEY, queryFn: api.fetchSkills })
}

function useSkillsMutation(mutationFn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: SKILLS_KEY }),
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
