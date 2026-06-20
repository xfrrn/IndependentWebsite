import Link from "next/link"

import { AGE_FILTERS } from "./constants"

type SearchParams = {
  age?: string
  type?: string
  price?: string
  skill?: string
  sort?: string
}

function buildQuery(searchParams: SearchParams, value?: string) {
  const next = { ...searchParams }
  if (!value || searchParams.age === value) {
    delete next.age
  } else {
    next.age = value
  }
  return next
}

export default function AgeQuickLinks({
  countryCode,
  searchParams,
}: {
  countryCode: string
  searchParams: SearchParams
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {AGE_FILTERS.map((age) => (
        <Link
          key={age}
          href={{
            pathname: `/${countryCode}/products`,
            query: buildQuery(searchParams, age),
          }}
          className={`rounded-2xl border px-4 py-3 text-center text-sm transition ${
            searchParams.age === age
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-black/10 bg-white/80 text-black/70 hover:border-black/20"
          }`}
        >
          {age}
        </Link>
      ))}
    </div>
  )
}
