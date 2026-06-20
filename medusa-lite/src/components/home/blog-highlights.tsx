import Link from "next/link"

import { BLOG_HIGHLIGHTS } from "@lib/data/homepage"
import SectionHeader from "./section-header"

export default function BlogHighlights() {
  return (
    <section className="bg-white">
      <div className="content-container ui-section">
        <SectionHeader
          eyebrow={BLOG_HIGHLIGHTS.eyebrow}
          title={BLOG_HIGHLIGHTS.title}
          subtitle={BLOG_HIGHLIGHTS.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_HIGHLIGHTS.posts.map((post) => (
            <article
              key={post.title}
              className="flex h-full flex-col ui-card ui-card-hover bg-[#f7f8fb] p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
                {post.date}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-black">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-black/60">{post.excerpt}</p>
              <Link
                href={post.href}
                className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.2em] text-black/60 ui-link"
              >
                Read article
                <span aria-hidden>{'->'}</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
