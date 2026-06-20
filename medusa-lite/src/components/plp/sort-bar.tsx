import Link from "next/link"

import { SORT_OPTIONS } from "./constants"

type SearchParams = {
  age?: string
  type?: string
  price?: string
  skill?: string
  sort?: string
}

function buildQuery(searchParams: SearchParams, value?: string) {
  const next = { ...searchParams }
  if (!value || value === "recommended") {
    delete next.sort
  } else {
    next.sort = value
  }
  return next
}

export default function SortBar({
  countryCode,
  searchParams,
  total,
}: {
  countryCode: string
  searchParams: SearchParams
  total: number
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-sm text-[color:var(--text-body)] shadow-[0_12px_30px_-24px_rgba(92,72,45,0.18)]">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
          Sort
        </span>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={{
                pathname: `/${countryCode}/products`,
                query: buildQuery(searchParams, option.value),
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                (searchParams.sort ?? "recommended") === option.value
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border-soft)] text-[color:var(--text-body)] hover:border-[color:var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
      <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
        {total} items
      </span>
    </div>
  )
}
