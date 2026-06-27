import { prisma } from "@/lib/db"
import Link from "next/link"
import {
  bulkDeleteCategories,
  createCategory,
  deleteCategory,
} from "../edit-actions"
import {
  BulkDeleteButton,
  DeleteButton,
  SelectAllCheckbox,
} from "../delete-button"

export const dynamic = "force-dynamic"

type AdminCategoriesProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function AdminCategories({ searchParams }: AdminCategoriesProps) {
  const error = (await searchParams)?.error
  const bulkFormId = "bulk-categories"
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
        className="mb-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        {error === "required" ? (
          <p className="text-sm text-red-600">请填写分类名称和标识。</p>
        ) : null}
        {error === "duplicate" ? (
          <p className="text-sm text-red-600">标识已存在，请换一个。</p>
        ) : null}
        {error === "save" ? (
          <p className="text-sm text-red-600">保存失败，请检查内容后重试。</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              分类名称
            </span>
            <input
              name="name"
              required
              placeholder="例如 Jewelry Sets"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              标识
            </span>
            <input
              name="handle"
              required
              placeholder="例如 jewelry-sets"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
            />
          </label>
          <button className="h-10 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800">
            新增分类
          </button>
        </div>
      </form>

      <form id={bulkFormId} action={bulkDeleteCategories} />
      <div className="mb-3 flex justify-end">
        <BulkDeleteButton
          form={bulkFormId}
          label="批量删除"
          message="确定删除选中的分类？"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <SelectAllCheckbox form={bulkFormId} name="ids" />
              </th>
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
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    form={bulkFormId}
                    name="ids"
                    value={c.id}
                    aria-label={`选择分类 ${c.name}`}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                </td>
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
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <DeleteButton
                        label="删除"
                        message={`确定删除分类“${c.name}”？`}
                      />
                    </form>
                  <Link href={`/admin/categories/${c.id}`} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
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
