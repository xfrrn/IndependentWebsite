"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { MarketingNavItem } from "@lib/data/homepage"
import MegaMenu from "./mega-menu"

type NavContent = {
  mobileBrowseLabel: string
  mobileCloseLabel: string
  exploreLabel: string
  megaMenuIntroLabelPrefix: string
  megaMenuIntroDescription: string
  mobileGoToPrefix: string
  items: MarketingNavItem[]
}

type NavCategory = {
  handle?: string | null
  metadata?: Record<string, unknown> | null
  name?: string | null
}

const CLOSE_DELAY_MS = 120

function stripCountry(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return "/"
  return `/${parts.slice(1).join("/")}`
}

function includesArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value)
}

function includesChinese(value: string) {
  return /[\u3400-\u9FFF]/.test(value)
}

function isAllProductsItem(item: MarketingNavItem) {
  const label = item.label.toLowerCase()
  return (
    item.href === "/products" ||
    label.includes("all products") ||
    item.label.includes("全部产品") ||
    item.label.includes("كل المنتجات")
  )
}

function isCategoryItem(item: MarketingNavItem) {
  const label = item.label.toLowerCase()
  return (
    label.includes("category") ||
    item.label.includes("类别") ||
    item.label.includes("分类") ||
    item.label.includes("الفئة") ||
    Boolean(item.groups?.length)
  )
}

function getNavLanguage(content: NavContent) {
  const labels = [
    content.mobileBrowseLabel,
    content.mobileCloseLabel,
    content.exploreLabel,
    content.megaMenuIntroLabelPrefix,
    ...content.items.map((item) => item.label),
  ].join(" ")

  if (includesArabic(labels)) {
    return "ar"
  }

  if (includesChinese(labels)) {
    return "zh"
  }

  return "en"
}

function getLanguageFromLocale(locale?: string | null) {
  const normalizedLocale = locale?.toLowerCase().replace("_", "-")

  if (normalizedLocale?.startsWith("ar")) {
    return "ar"
  }

  if (normalizedLocale?.startsWith("zh")) {
    return "zh"
  }

  return null
}

function getCategoryImage(category: NavCategory) {
  const metadata = category.metadata ?? {}
  const image =
    metadata.image ??
    metadata.image_url ??
    metadata.thumbnail ??
    metadata.thumbnail_url

  return typeof image === "string" && image.trim() ? image : undefined
}

function getCategoryGroups(
  language: ReturnType<typeof getNavLanguage>,
  categories?: NavCategory[] | null
) {
  const title =
    language === "ar" ? "الفئة" : language === "zh" ? "分类" : "Category"
  const categoryLinks = categories
    ?.filter((category) => category.handle && category.name)
    .map((category) => ({
      image: getCategoryImage(category),
      label: category.name as string,
      href: `/shop/category/${category.handle}`,
    }))

  return categoryLinks?.length
    ? [
        {
          title,
          links: categoryLinks,
        },
      ]
    : []
}

function getDefaultLabels(
  language: ReturnType<typeof getNavLanguage>,
  categories?: NavCategory[] | null
) {
  if (language === "ar") {
    return {
      allProducts: "كل المنتجات",
      category: "الفئة",
      groups: getCategoryGroups(language, categories),
    }
  }

  if (language === "zh") {
    return {
      allProducts: "全部产品",
      category: "分类",
      groups: getCategoryGroups(language, categories),
    }
  }

  return {
    allProducts: "ALL PRODUCTS",
    category: "CATEGORY",
    groups: getCategoryGroups(language, categories),
  }
}

function getVisibleItems(
  content: NavContent,
  locale?: string | null,
  categories?: NavCategory[] | null
) {
  const language = getLanguageFromLocale(locale) ?? getNavLanguage(content)
  const defaults = getDefaultLabels(language, categories)
  const allProducts = content.items.find(isAllProductsItem) ?? {
    label: defaults.allProducts,
    href: "/products",
  }
  const category = content.items.find(isCategoryItem) ?? {
    label: defaults.category,
    groups: defaults.groups,
  }
  const visibleItems = [
    {
      ...allProducts,
      label: defaults.allProducts,
      href: "/products",
    },
  ]

  if (!defaults.groups.length) {
    return visibleItems
  }

  return [
    ...visibleItems,
    {
      ...category,
      label: defaults.category,
      href: undefined,
      groups: defaults.groups,
    },
  ]
}

export default function PrimaryNav({
  categories,
  content,
  currentLocale,
}: {
  categories?: NavCategory[] | null
  content: NavContent
  currentLocale?: string | null
}) {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const pathname = usePathname()
  const normalizedPath = stripCountry(pathname)
  const visibleItems = getVisibleItems(content, currentLocale, categories)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      setOpenItem(null)
    }, CLOSE_DELAY_MS)
  }

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [])

  return (
    <div
      className="relative border-b border-[color:var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_18px_40px_-35px_rgba(85,63,39,0.12)]"
      onMouseLeave={scheduleClose}
      onMouseEnter={clearCloseTimer}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenItem(null)
        }
      }}
    >
      <div className="content-container flex items-center justify-between py-3">
        <button
          className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-body)] md:hidden"
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="primary-nav-mobile"
        >
          {mobileOpen ? content.mobileCloseLabel : content.mobileBrowseLabel}
        </button>

        <ul className="hidden items-center gap-8 text-sm text-[color:var(--text-body)] md:flex">
          {visibleItems.map((item) => {
            const href = item.href ?? item.groups?.[0]?.links[0]?.href ?? "#"
            const isActive = item.href && normalizedPath.startsWith(item.href)

            return (
              <li
                key={item.label}
                onMouseEnter={() => {
                  clearCloseTimer()
                  setOpenItem(item.label)
                }}
                onFocus={() => setOpenItem(item.label)}
                className="relative"
              >
                <Link
                  href={href}
                  aria-expanded={
                    item.groups ? openItem === item.label : undefined
                  }
                  aria-controls={
                    item.groups
                      ? `mega-menu-${item.label
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      : undefined
                  }
                  className={`flex items-center gap-2 border-b-2 px-1 pb-1 font-semibold uppercase tracking-[0.18em] transition duration-200 ease-out ui-focus ${
                    isActive
                      ? "border-[color:var(--accent)] text-[color:var(--accent-strong)]"
                      : openItem === item.label
                      ? "border-[color:var(--accent)] text-[color:var(--accent-strong)]"
                      : "border-transparent hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent-strong)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)] md:block">
          {content.exploreLabel}
        </div>
      </div>

      {visibleItems.map((item) =>
        item.groups && openItem === item.label ? (
          <div
            key={item.label}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <MegaMenu item={item} content={content} />
          </div>
        ) : null
      )}

      {mobileOpen ? (
        <div
          id="primary-nav-mobile"
          className="border-t border-[color:var(--border-soft)] bg-[var(--bg-surface)] md:hidden"
        >
          <div className="content-container flex flex-col gap-3 py-4 text-sm text-[color:var(--text-body)]">
            {visibleItems.map((item) => {
              const href = item.href ?? item.groups?.[0]?.links[0]?.href ?? "#"

              return (
                <details
                  key={item.label}
                  className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <summary className="cursor-pointer list-none font-semibold uppercase tracking-[0.18em]">
                    {item.label}
                  </summary>
                  {item.groups ? (
                    <div className="mt-3 grid gap-4 text-xs text-[color:var(--text-body)]">
                      {item.groups.map((group) => (
                        <div key={group.title}>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                            {group.title}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {group.links.map((link) => (
                              <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-2 rounded-xl bg-[var(--bg-surface)] p-2 transition duration-200 ease-out hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)]"
                              >
                                {link.image ? (
                                  <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border-soft)]">
                                    <img
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      src={link.image}
                                    />
                                  </span>
                                ) : null}
                                <span>{link.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-body)] ui-link"
                    >
                      {content.mobileGoToPrefix} {item.label}
                    </Link>
                  )}
                </details>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
