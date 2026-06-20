import { prisma } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { variants: true, categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">Products</h1>
        <span className="text-sm text-neutral-500">{products.length} products</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Handle</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-neutral-800 hover:text-emerald-600">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{p.handle}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {p.categories.map((pc) => pc.category.name).join(", ")}
                </td>
                <td className="px-4 py-3 text-neutral-500">{p.variants.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {p.status}
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
