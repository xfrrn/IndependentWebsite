import Link from "next/link"

import { BRAND_INTRO } from "@lib/data/homepage"

export default function BrandIntro() {
  return (
    <section className="bg-white">
      <div className="content-container grid gap-8 py-16 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-[#fff4ea] p-8 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.35)]">
          <span className="inline-flex rounded-full bg-[#ff5b5b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            {BRAND_INTRO.badge}
          </span>
          <div className="mt-6 h-48 rounded-2xl bg-white/80" />
          <Link
            href={BRAND_INTRO.ctaHref}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
          >
            {BRAND_INTRO.cta}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            {BRAND_INTRO.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-black">
            {BRAND_INTRO.title}
          </h2>
          <p className="mt-3 text-lg text-black/70">{BRAND_INTRO.subtitle}</p>
          <p className="mt-4 text-sm leading-6 text-black/60">
            {BRAND_INTRO.body}
          </p>
        </div>
      </div>
    </section>
  )
}
