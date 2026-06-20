const TRUST_ITEMS = [
  {
    title: "Age-appropriate picks",
    description: "Clear guidance for every stage.",
  },
  {
    title: "Safe materials",
    description: "Smooth finishes and trusted sources.",
  },
  {
    title: "Fast shipping",
    description: "Most orders ship within 48 hours.",
  },
  {
    title: "Parent-loved support",
    description: "Friendly help whenever you need it.",
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-[#f1f6ff]">
      <div className="content-container py-12">
        <div className="grid gap-6 text-center md:grid-cols-4 md:text-left">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-black/5 bg-white/90 px-4 py-5 shadow-[0_16px_36px_-30px_rgba(0,0,0,0.25)]"
            >
              <p className="text-sm font-semibold text-black">{item.title}</p>
              <p className="mt-2 text-xs text-black/60">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
