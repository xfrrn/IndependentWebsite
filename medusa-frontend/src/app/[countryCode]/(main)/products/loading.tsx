export default function Loading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="mb-10 h-24 rounded-3xl bg-white/70" />
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-2xl bg-white/70" />
          ))}
        </div>
        <div className="h-14 rounded-2xl bg-white/70" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="h-96 rounded-3xl bg-white/70" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-80 rounded-3xl bg-white/70" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
