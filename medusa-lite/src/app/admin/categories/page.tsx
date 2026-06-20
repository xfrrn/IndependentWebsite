import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    include: { parent: true, children: true, products: true },
    orderBy: { rank: "asc" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">Categories</h1>
        <span className="text-sm text-neutral-500">{categories.length} categories</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Handle</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Children</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{c.name}</td>
                <td className="px-4 py-3 text-neutral-500">{c.handle}</td>
                <td className="px-4 py-3 text-neutral-500">{c.parent?.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{c.children.map((ch) => ch.name).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{c.products.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {c.isActive ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
