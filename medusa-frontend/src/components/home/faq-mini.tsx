"use client"

import { useState } from "react"

const FAQ_ITEMS = [
  {
    question: "How do I choose by age?",
    answer: "Start with the age tag on each product or the shop-by-age grid.",
  },
  {
    question: "Are materials safety-tested?",
    answer: "We prioritize child-safe materials and clear safety notes.",
  },
  {
    question: "How fast is shipping?",
    answer: "Most orders ship within 48 hours.",
  },
  {
    question: "Can I return gifts?",
    answer: "Yes, unopened gifts are eligible for return within 7 days.",
  },
]

export default function FaqMini() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="bg-[#f7f2ea]">
      <div className="content-container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-black">
              Quick answers for parents
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-black/60">
              Clear guidance before checkout.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <button
                key={item.question}
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full flex-col gap-3 rounded-3xl border border-black/5 bg-white/90 px-6 py-5 text-left shadow-[0_16px_36px_-30px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-black">
                    {item.question}
                  </span>
                  <span className="text-xl text-black/40">
                    {isOpen ? "–" : "+"}
                  </span>
                </div>
                {isOpen ? (
                  <p className="text-sm text-black/60">{item.answer}</p>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
