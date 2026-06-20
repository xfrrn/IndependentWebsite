import Link from "next/link"

import { ANNOUNCEMENT } from "@lib/data/homepage"

export default function AnnouncementBar() {
  return (
    <div className="bg-[#1f5eff] text-white">
      <div className="content-container flex items-center justify-between gap-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
        <span>{ANNOUNCEMENT.text}</span>
        <Link
          href={ANNOUNCEMENT.href}
          aria-label={ANNOUNCEMENT.ctaLabel}
          className="rounded-full border border-white/60 px-3 py-1 text-[10px] tracking-[0.22em] transition duration-200 ease-out hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80"
        >
          {ANNOUNCEMENT.ctaLabel}
        </Link>
      </div>
    </div>
  )
}
