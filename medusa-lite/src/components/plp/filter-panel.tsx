import Link from "next/link"

import { AGE_FILTERS, PRICE_FILTERS, SKILL_FILTERS, TYPE_FILTERS } from "./constants"

type SearchParams = {
  age?: string
  type?: string
  price?: string
  skill?: string
  sort?: string
}

function buildQuery(
  searchParams: SearchParams,
  key: keyof SearchParams,
  value?: string
) {
  const next = { ...searchParams }
  if (!value || searchParams[key] === value) {
    delete next[key]
  } else {
    next[key] = value
  }
  return next
}

export default function FilterPanel({
  countryCode,
  searchParams,
}: {
  countryCode: string
  searchParams: SearchParams
}) {
  return (
    <aside className="space-y-6 rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]">
      <div>
        <p className="text-sm font-semibold text-black">Age range</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AGE_FILTERS.map((age) => (
            <Link
              key={age}
              href={{
                pathname: `/${countryCode}/products`,
                query: buildQuery(searchParams, "age", age),
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                searchParams.age === age
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-black/10 text-black/60 hover:border-black/20"
              }`}
            >
              {age}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-black">Toy type</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((type) => (
            <Link
              key={type}
              href={{
                pathname: `/${countryCode}/products`,
                query: buildQuery(searchParams, "type", type),
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                searchParams.type === type
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-black/10 text-black/60 hover:border-black/20"
              }`}
            >
              {type}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-black">Skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SKILL_FILTERS.map((skill) => (
            <Link
              key={skill}
              href={{
                pathname: `/${countryCode}/products`,
                query: buildQuery(searchParams, "skill", skill),
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                searchParams.skill === skill
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-black/10 text-black/60 hover:border-black/20"
              }`}
            >
              {skill}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-black">Price</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_FILTERS.map((range) => (
            <Link
              key={range.label}
              href={{
                pathname: `/${countryCode}/products`,
                query: buildQuery(searchParams, "price", range.label),
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                searchParams.price === range.label
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-black/10 text-black/60 hover:border-black/20"
              }`}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
