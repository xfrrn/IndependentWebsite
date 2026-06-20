import Link from "next/link"

import { LEARNING_TOOLS_SPOTLIGHT } from "@lib/data/homepage"

export default function LearningToolsSpotlight() {
  return (
    <section className="bg-white">
      <div className="content-container ui-section">
        <h2 className="text-2xl font-semibold text-black">
          {LEARNING_TOOLS_SPOTLIGHT.title}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {LEARNING_TOOLS_SPOTLIGHT.items.map((item) => (
            <div
              key={item.title}
              className="ui-card ui-card-hover bg-[#f9f7f2] p-6"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                {item.tag}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-black">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-black/60">{item.description}</p>
              <Link href={item.href} className="mt-6 ui-button">
                Learn more
                <span aria-hidden>{'->'}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
