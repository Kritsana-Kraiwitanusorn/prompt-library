export default function PromptCardSkeleton() {
  return (
    <div className="idx-card animate-pulse">
      <div className="flex gap-2 mb-3">
        <span className="skeleton-block w-16 h-4 rounded" />
        <span className="skeleton-block w-12 h-4 rounded" />
      </div>
      <span className="skeleton-block w-3/4 h-4 rounded mb-3" />
      <span className="skeleton-block w-full h-3 rounded mb-1.5" />
      <span className="skeleton-block w-full h-3 rounded mb-1.5" />
      <span className="skeleton-block w-2/3 h-3 rounded mb-4" />
      <div className="card-meta">
        <span className="skeleton-block w-8 h-3 rounded" />
        <span className="skeleton-block w-20 h-3 rounded" />
      </div>
    </div>
  )
}

export function PromptGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  )
}
