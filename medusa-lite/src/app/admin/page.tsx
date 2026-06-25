import Link from "next/link"
import { prisma } from "@/lib/db"
import { getTrafficOverview } from "@/lib/analytics"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [productCount, categoryCount, traffic] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    getTrafficOverview(),
  ])

  const cards = [
    { label: "商品", value: productCount, href: "/admin/products" },
    { label: "分类", value: categoryCount, href: "/admin/categories" },
    { label: "今日访问", value: traffic.today, href: "#" },
    { label: "近7天访问", value: traffic.last7Days, href: "#" },
    { label: "总访问", value: traffic.total, href: "#" },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-800">后台概览</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
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

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              热门页面
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              按访问次数统计前台页面，最多展示前 5 个。
            </p>
          </div>
        </div>

        {traffic.topPages.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-neutral-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">页面</th>
                  <th className="w-32 px-4 py-3 text-right font-medium">
                    访问次数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {traffic.topPages.map((page) => (
                  <tr key={page.path}>
                    <td className="px-4 py-3 text-neutral-700">
                      <span className="break-all">{page.path}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                      {page.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
            暂无访问数据，前台页面被访问后会自动记录。
          </div>
        )}
      </section>
    </div>
  )
}
