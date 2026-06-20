import Link from "next/link"

import { HERO_CONTENT, HERO_IMAGES } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import HeroCarousel from "./hero-carousel"

export default async function HeroIntro({
  currentLocale,
}: {
  currentLocale: string | null
}) {
  const content = await getLocalizedHomeContentSection(
    "hero_content",
    HERO_CONTENT,
    currentLocale
  )

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container ui-section-tight">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[linear-gradient(135deg,#070605_0%,#17120b_48%,#30220d_100%)] shadow-[0_34px_82px_-42px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(212,175,55,0.14)_0%,rgba(212,175,55,0)_34%,rgba(0,0,0,0.22)_100%)]" />

          <div className="grid min-h-[460px] items-stretch lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 flex flex-col justify-center px-8 py-14 text-white md:px-14 lg:px-16">
              <span className="inline-flex w-fit rounded-full bg-white/14 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/90 backdrop-blur-sm">
                {content.eyebrow}
              </span>
              <h1 className="mt-6 max-w-[10ch] text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-[#fff8ef] md:text-6xl">
                {content.title.split("\n").map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/88 md:text-lg">
                {content.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={content.primaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-bold text-[#080706] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
                >
                  {content.primaryCtaLabel}
                </Link>
                <Link
                  href={content.secondaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/28 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition duration-300 ease-out hover:bg-white/18"
                >
                  {content.secondaryCtaLabel}
                </Link>
              </div>
            </div>

            <div className="relative min-h-[280px] lg:min-h-full">
              <div className="absolute inset-y-0 left-[-8%] hidden w-28 rounded-[2.5rem] bg-[rgba(212,175,55,0.16)] lg:block" />
              <HeroCarousel images={HERO_IMAGES} />

              <div className="absolute left-6 top-6 rounded-[1.75rem] border border-[rgba(212,175,55,0.25)] bg-[rgba(8,7,6,0.78)] px-5 py-4 text-[color:var(--text-strong)] shadow-[0_20px_35px_-28px_rgba(0,0,0,0.7)] backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">
                  {content.badgeLabel}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {content.badgeText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
