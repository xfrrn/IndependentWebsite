"use client"

import Link from "next/link"

import type { MarketingNavItem } from "@lib/data/homepage"

type MegaMenuContent = {
  megaMenuIntroLabelPrefix: string
  megaMenuIntroDescription: string
}

export default function MegaMenu({
  item,
  content,
}: {
  item: MarketingNavItem
  content: MegaMenuContent
}) {
  if (!item.groups || item.groups.length === 0) {
    return null
  }

  return (
    <div
      id={`mega-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      className="ui-dropdown-surface ui-dropdown-enter absolute left-0 right-0 top-full z-[60] overflow-hidden rounded-b-[2rem]"
    >
      <div className="border-t border-[color:var(--border-soft)]">
        <div className="content-container py-8">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.88)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                {content.megaMenuIntroLabelPrefix} {item.label}
              </p>
              <p className="mt-4 text-sm text-[color:var(--text-body)]">
                {content.megaMenuIntroDescription}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.88)] p-6">
              <div className="grid gap-8 md:grid-cols-2">
                {item.groups.map((group) => (
                  <div key={group.title}>
                    <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      {group.title}
                    </p>
                    <ul className="mt-4 grid gap-3">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="inline-flex rounded-full px-3 py-2 text-sm text-[color:var(--text-body)] transition duration-200 ease-out hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)] ui-focus"
                          >
                            {link.label}
                          </Link>
                          {link.description ? (
                            <p className="mt-1 px-3 text-xs text-[color:var(--text-muted)]">
                              {link.description}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
