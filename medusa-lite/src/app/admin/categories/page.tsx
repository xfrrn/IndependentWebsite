import { prisma } from "@/lib/db"
import Link from "next/link"
import { createCategory } from "../edit-actions"

export const dynamic = "force-dynamic"

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    include: { parent: true, children: true, products: true },
    orderBy: { rank: "asc" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">分类</h1>
        <span className="text-sm text-neutral-500">共 {categories.length} 个分类</span>
      </div>

      <form
        action={createCategory}
        className="mb-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          name="name"
          placeholder="新分类名称"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
        />
        <input
          name="handle"
          placeholder="标识，例如 new-category"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
        />
        <button className="rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800">
          新增分类
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">标识</th>
              <th className="px-4 py-3">父级</th>
              <th className="px-4 py-3">子分类</th>
              <th className="px-4 py-3">商品</th>
              <th className="px-4 py-3">启用</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">
                  <Link href={`/admin/categories/${c.id}`} className="hover:text-emerald-700">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{c.handle}</td>
                <td className="px-4 py-3 text-neutral-500">{c.parent?.name ?? "无"}</td>
                <td className="px-4 py-3 text-neutral-500">{c.children.map((ch) => ch.name).join(", ") || "无"}</td>
                <td className="px-4 py-3 text-neutral-500">{c.products.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {c.isActive ? "是" : "否"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/categories/${c.id}`} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
