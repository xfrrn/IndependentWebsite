"use client"

import { useState } from "react"
import Link from "next/link"

import { PROMO_HERO } from "@lib/data/homepage"

export default function VideoHero() {
  const [hasError, setHasError] = useState(false)

  return (
    <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-black">
      {!hasError ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={PROMO_HERO.posterSrc}
          onError={() => setHasError(true)}
        >
          <source src={PROMO_HERO.videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${PROMO_HERO.posterSrc})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="content-container relative h-full">
        <div className="absolute bottom-10 right-6 max-w-xs rounded-3xl bg-white/95 p-5 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            {PROMO_HERO.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-black">
            {PROMO_HERO.title}
          </h2>
          <p className="mt-2 text-sm text-black/60">{PROMO_HERO.body}</p>
          <Link
            href={PROMO_HERO.ctaHref}
            aria-label={PROMO_HERO.ctaLabel}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff5b5b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            {PROMO_HERO.ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
