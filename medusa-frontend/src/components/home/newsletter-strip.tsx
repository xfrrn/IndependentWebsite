const NEWSLETTER_COPY = {
  title: "Get 10% Off Your First Order!",
  placeholder: "Enter your email",
  cta: "Subscribe",
}

export default function NewsletterStrip() {
  return (
    <section className="relative z-10 -mt-6 bg-[#f1f6ff] md:-mt-10">
      <div className="content-container flex flex-col items-center gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-black/80">
          {NEWSLETTER_COPY.title}
        </p>
        <div className="flex w-full max-w-lg flex-col gap-3 md:flex-row md:items-center">
          <input
            type="email"
            placeholder={NEWSLETTER_COPY.placeholder}
            className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm focus:outline-none"
          />
          <button
            type="button"
            className="rounded-full bg-black px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            {NEWSLETTER_COPY.cta}
          </button>
        </div>
      </div>
    </section>
  )
}
