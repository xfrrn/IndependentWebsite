import { HERO_CONTENT, HERO_IMAGES } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import HeroCarousel from "./hero-carousel"

type HeroContent = typeof HERO_CONTENT & {
  images?: typeof HERO_IMAGES
}

export default async function HeroIntro({
  currentLocale,
}: {
  currentLocale: string | null
}) {
  const content = await getLocalizedHomeContentSection<HeroContent>(
    "hero_content",
    { ...HERO_CONTENT, images: HERO_IMAGES },
    currentLocale
  )
  const images = content.images?.length ? content.images : HERO_IMAGES

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container ui-section-tight">
        <div className="relative aspect-[16/7] min-h-[260px] overflow-hidden rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[#080706] shadow-[0_34px_82px_-42px_rgba(0,0,0,0.9)] md:min-h-[420px]">
          <HeroCarousel images={images} />
        </div>
      </div>
    </section>
  )
}
