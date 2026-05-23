import Image from "next/image"
import Link from "next/link"

import { HERO_CONTENT, HERO_IMAGE } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"

export default async function HeroIntro() {
  const content = await getSiteContentSection("hero_content", HERO_CONTENT)

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container ui-section-tight">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-[#d94b3d] shadow-[0_30px_70px_-40px_rgba(126,61,34,0.42)]">
          <div className="absolute left-[-5%] top-[-12%] h-40 w-40 rounded-[2rem] bg-[#c43629]/70 blur-sm md:h-64 md:w-64" />
          <div className="absolute left-[12%] top-[8%] h-14 w-14 rounded-full bg-[#f6a28a]/60 md:h-20 md:w-20" />
          <div className="absolute left-[30%] bottom-[12%] h-12 w-12 rounded-full bg-[#f5c14e]" />
          <div className="absolute right-[42%] top-[16%] h-10 w-10 rounded-full bg-[#f5b0a2]/70" />
          <div className="absolute right-[8%] bottom-[10%] h-20 w-20 rounded-full bg-[#f4aa3f]/20 blur-[2px]" />

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
                  className="inline-flex items-center gap-2 rounded-full bg-[#f2a26b] px-6 py-3 text-sm font-bold text-[#342d24] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#f6b27f]"
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
              <div className="absolute inset-y-0 left-[-8%] hidden w-28 rounded-[2.5rem] bg-[#c43629] lg:block" />
              <div className="absolute inset-0 rounded-t-[2.5rem] lg:left-[4%] lg:top-[4%] lg:bottom-[4%] lg:right-[4%] lg:rounded-[2.5rem]">
                <Image
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,242,0.02)_0%,rgba(52,45,36,0.08)_100%)]" />
              </div>

              <div className="absolute left-6 top-6 rounded-[1.75rem] bg-[rgba(255,248,239,0.9)] px-5 py-4 text-[#342d24] shadow-[0_20px_35px_-28px_rgba(52,45,36,0.38)] backdrop-blur-sm">
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
