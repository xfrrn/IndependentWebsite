"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type HeroCarouselImage = {
  alt: string
  src: string
}

const SLIDE_INTERVAL_MS = 4500

export default function HeroCarousel({
  images,
}: {
  images: HeroCarouselImage[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0]

  useEffect(() => {
    if (images.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [images.length])

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">
      {activeImage ? (
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority={activeIndex === 0}
          sizes="(min-width: 1024px) 1120px, 100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,242,0.02)_0%,rgba(52,45,36,0.08)_100%)]" />
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image.src}-dot`}
            type="button"
            className={`h-2.5 w-2.5 rounded-full border border-white/70 transition ${
              index === activeIndex ? "bg-white" : "bg-white/30"
            }`}
            aria-label={`Show hero image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
