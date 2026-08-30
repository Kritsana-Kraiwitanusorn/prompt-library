import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// Persisting to localStorage means a page reload can render the last-known
// prompt list immediately (cache-first), then quietly refetch in the
// background once the network is available — no blank/loading screen for
// returning visitors even on a slow connection.
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'prompt-library-cache',
})

// Bump this if the cached data shape ever changes incompatibly — old caches
// with a different buster are discarded instead of causing runtime errors.
export const PERSIST_BUSTER = 'v1'
