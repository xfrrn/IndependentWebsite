import Image from "next/image"
import Link from "next/link"

import { AGE_HIGHLIGHTS } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"

type CategoryCircleItem = {
  value: string
  unit?: string
  title: string
  href: string
  image?: string
}

export default async function AgeShopGrid({
  currentLocale,
}: {
  currentLocale: string | null
}) {
  const content = await getLocalizedHomeContentSection(
    "age_highlights",
    AGE_HIGHLIGHTS,
    currentLocale
  )

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
              {content.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">
              {content.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-body)]">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
          {(content.items as CategoryCircleItem[]).map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="pointer-events-none absolute top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.38)_0%,rgba(212,175,55,0)_72%)] opacity-0 blur-2xl transition duration-300 ease-out group-hover:opacity-100" />
              <div className="relative flex aspect-square w-full max-w-[260px] items-center justify-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.26)] bg-[linear-gradient(145deg,#080705_0%,#1b1510_55%,#090807_100%)] p-4 shadow-[0_22px_52px_-30px_rgba(0,0,0,0.8)] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-[rgba(244,211,94,0.7)] group-hover:shadow-[0_30px_70px_-28px_rgba(212,175,55,0.32)]">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-[rgba(212,175,55,0.2)] bg-[radial-gradient(circle,#4c3920_0%,#16100b_72%)] px-4 text-lg font-semibold text-[color:var(--accent)]">
                    {card.value}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_28%),linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.38)_100%)]" />
              </div>
              <p className="mt-5 text-lg font-medium text-[color:var(--text-strong)] underline-offset-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)] group-hover:underline">
                {card.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
