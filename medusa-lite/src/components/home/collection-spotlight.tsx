import Link from "next/link"

import { COLLECTION_SPOTLIGHT } from "@lib/data/homepage"
import SectionHeader from "./section-header"

export default function CollectionSpotlight() {
  return (
    <section className="bg-white">
      <div className="content-container py-16">
        <SectionHeader
          eyebrow={COLLECTION_SPOTLIGHT.eyebrow}
          title={COLLECTION_SPOTLIGHT.title}
          subtitle={COLLECTION_SPOTLIGHT.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTION_SPOTLIGHT.items.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-black/5 bg-[#f9f7f2] p-6 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                    {item.tag}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-black">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-black/60">
                    {item.description}
                  </p>
                </div>
                <div className="ml-4 h-12 w-12 rounded-2xl bg-white/80" />
              </div>
              <Link
                href={item.href}
                aria-label={`Shop ${item.title}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
              >
                Shop now
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
