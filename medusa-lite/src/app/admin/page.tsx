import Link from "next/link"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [productCount, categoryCount, regionCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.region.count(),
  ])

  const cards = [
    { label: "商品", value: productCount, href: "/admin/products" },
    { label: "分类", value: categoryCount, href: "/admin/categories" },
    { label: "地区", value: regionCount, href: "#" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-800">后台概览</h1>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-3xl font-bold text-neutral-800">{card.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
