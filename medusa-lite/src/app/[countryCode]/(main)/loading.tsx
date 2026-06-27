function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[rgba(255,250,242,0.08)] ${className}`}
    />
  )
}

export default function MainLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] px-6 py-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SkeletonBlock className="h-10 w-48" />
          <SkeletonBlock className="h-12 flex-1 md:max-w-xl" />
          <SkeletonBlock className="h-10 w-40" />
        </div>
        <SkeletonBlock className="h-[48vh] min-h-80" />
        <div className="grid gap-5 md:grid-cols-3">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
        </div>
      </div>
    </main>
  )
}
