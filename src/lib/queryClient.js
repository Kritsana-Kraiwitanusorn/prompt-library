import { QueryClient } from '@tanstack/react-query'

// staleTime keeps cached data usable immediately on revisit while a
// background refetch syncs it. gcTime controls how long unused data stays
// in memory (and, combined with the persister in main.jsx, in localStorage)
// so a reload can paint instantly from cache before the network responds.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute — data is "fresh enough" to skip a refetch
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — how long it survives in the persisted cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // sync as soon as the network comes back
    },
  },
})
