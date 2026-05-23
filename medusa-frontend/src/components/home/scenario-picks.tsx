import Link from "next/link"

const SCENARIO_CARDS = [
  {
    title: "Gifts by Age",
    description: "Thoughtful picks for birthdays and milestones.",
    ctaLabel: "Shop Gifts",
    href: "/shop/scenario/gifts",
  },
  {
    title: "Travel Toys",
    description: "Compact, calm play for on-the-go moments.",
    ctaLabel: "Shop Travel",
    href: "/shop/scenario/travel",
  },
  {
    title: "Quiet Time Favorites",
    description: "Independent play that feels peaceful and focused.",
    ctaLabel: "Shop Quiet Time",
    href: "/shop/scenario/quiet-time",
  },
]

export default function ScenarioPicks() {
  return (
    <section className="bg-white">
      <div className="content-container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Scenarios
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-black">
              Shop by moment
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-black/60">
              Easy pathways for gifts, travel, and quiet play.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SCENARIO_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-black/5 bg-[#f9f7f2] p-6 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                    {card.title}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-black">
                    {card.description}
                  </p>
                </div>
                <div className="ml-4 h-12 w-12 rounded-2xl bg-white/80" />
              </div>
              <Link
                href={card.href}
                aria-label={card.ctaLabel}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
              >
                {card.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
