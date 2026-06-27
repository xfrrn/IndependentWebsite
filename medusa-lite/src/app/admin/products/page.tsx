import { prisma } from "@/lib/db"
import Link from "next/link"
import { createProduct, deleteProduct, importProducts } from "../edit-actions"
import { DeleteButton } from "../delete-button"

export const dynamic = "force-dynamic"

type AdminProductsProps = {
  searchParams?: Promise<{ error?: string; imported?: string }>
}

export default async function AdminProducts({ searchParams }: AdminProductsProps) {
  const query = await searchParams
  const error = query?.error
  const imported = query?.imported
  const products = await prisma.product.findMany({
    include: { variants: true, categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">商品</h1>
        <span className="text-sm text-neutral-500">共 {products.length} 个商品</span>
      </div>

      <form
        action={createProduct}
        className="mb-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        {error === "required" ? (
          <p className="text-sm text-red-600 md:col-span-3">请填写商品名称和标识。</p>
        ) : null}
        {error === "duplicate" ? (
          <p className="text-sm text-red-600 md:col-span-3">标识已存在，请换一个。</p>
        ) : null}
        {error === "save" ? (
          <p className="text-sm text-red-600 md:col-span-3">保存失败，请检查内容后重试。</p>
        ) : null}
        {error === "import" ? (
          <p className="text-sm text-red-600 md:col-span-3">
            导入失败，请上传包含“图片、名称、分类”表头的 Excel 文件。
          </p>
        ) : null}
        {imported ? (
          <p className="text-sm text-emerald-700 md:col-span-3">
            已导入 {imported} 个商品。
          </p>
        ) : null}
        <input
          name="title"
          required
          placeholder="新商品名称"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
        />
        <input
          name="handle"
          required
          placeholder="标识，例如 new-product"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
        />
        <button className="rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800">
          新增商品
        </button>
      </form>

      <form
        action={importProducts}
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:flex-row md:items-center"
      >
        <input
          type="file"
          name="file"
          required
          accept=".xlsx,.xls"
          className="text-sm text-neutral-700 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
        />
        <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          导入 Excel
        </button>
        <span className="text-sm text-neutral-500">
          表头：图片、名称、分类；图片填 URL。
        </span>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">商品</th>
              <th className="px-4 py-3">标识</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">变体</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3"></th>
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
                    {p.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <DeleteButton
                        label="删除"
                        message={`确定删除商品“${p.title}”？`}
                      />
                    </form>
                  <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    编辑
                  </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
