import Link from "next/link"

import { AGE_HIGHLIGHTS } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"

export default async function AgeShopGrid() {
  const content = await getSiteContentSection("age_highlights", AGE_HIGHLIGHTS)

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              {content.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-black">
              {content.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-black/60">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
          {content.items.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="pointer-events-none absolute top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(232,241,228,0.92)_0%,rgba(232,241,228,0)_72%)] opacity-0 blur-2xl transition duration-300 ease-out group-hover:opacity-100" />
              <div className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-full border border-transparent bg-[var(--bg-panel)] shadow-[0_18px_36px_-30px_rgba(92,72,45,0.14)] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-[color:var(--accent)]/18 group-hover:bg-[#ece2d4] group-hover:shadow-[0_24px_48px_-30px_rgba(92,72,45,0.22)]">
                <div className="flex flex-col items-center leading-none text-black transition duration-300 ease-out group-hover:text-[color:var(--accent-strong)]">
                  <span className="text-4xl font-semibold tracking-[-0.04em] transition duration-300 ease-out group-hover:scale-[1.04] md:text-5xl">
                    {card.value}
                  </span>
                  <span className="mt-3 text-2xl font-semibold transition duration-300 ease-out group-hover:scale-[1.04] md:text-3xl">
                    {card.unit}
                  </span>
                </div>
              </div>
              <p className="mt-5 text-lg font-medium text-black underline-offset-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent-strong)] group-hover:underline">
                {card.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
