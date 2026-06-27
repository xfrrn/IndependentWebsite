import { prisma } from "@/lib/db"
import Link from "next/link"
import SubmitButton from "@components/forms/submit-button"
import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  importProducts,
} from "../edit-actions"
import {
  BulkDeleteButton,
  DeleteButton,
  SelectAllCheckbox,
} from "../delete-button"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

type AdminProductsProps = {
  searchParams?: Promise<{
    error?: string
    imported?: string
    page?: string
    q?: string
  }>
}

export default async function AdminProducts({ searchParams }: AdminProductsProps) {
  const query = await searchParams
  const error = query?.error
  const imported = query?.imported
  const q = (query?.q || "").trim()
  const page = pageNumber(query?.page)
  const bulkFormId = "bulk-products"
  const search = { contains: q, mode: "insensitive" as const }
  const where = q
    ? {
        OR: [
          { title: search },
          { handle: search },
          { categories: { some: { category: { name: search } } } },
        ],
      }
    : {}
  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ])
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-800">商品</h1>
        <span className="text-sm text-neutral-500">共 {totalProducts} 个商品</span>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <form
          action={createProduct}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-neutral-800">新增商品</h2>
          {error === "required" ? (
            <p className="text-sm text-red-600">请填写商品名称和标识。</p>
          ) : null}
          {error === "duplicate" ? (
            <p className="text-sm text-red-600">标识已存在，请换一个。</p>
          ) : null}
          {error === "save" ? (
            <p className="text-sm text-red-600">保存失败，请检查内容后重试。</p>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              商品名称
            </span>
            <input
              name="title"
              required
              placeholder="例如 Jewelry Set"
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
              placeholder="例如 jewelry-set"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
            />
          </label>
          <SubmitButton
            pendingLabel="新增中..."
            className="h-10 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
          >
            新增商品
          </SubmitButton>
        </form>

        <form
          action={importProducts}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-neutral-800">Excel 导入</h2>
          {error === "import" ? (
            <p className="text-sm text-red-600">
              导入失败，请上传包含“图片、名称、分类”表头的 Excel 文件。
            </p>
          ) : null}
          {imported ? (
            <p className="text-sm text-emerald-700">已导入 {imported} 个商品。</p>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Excel 文件
            </span>
            <input
              type="file"
              name="file"
              required
              accept=".xlsx,.xls"
              className="w-full text-sm text-neutral-700 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
            />
          </label>
          <p className="text-sm text-neutral-500">
            表头：图片、名称、分类；图片填 URL。
          </p>
          <SubmitButton
            pendingLabel="导入中..."
            className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
          >
            导入 Excel
          </SubmitButton>
        </form>
      </div>

      <form id={bulkFormId} action={bulkDeleteProducts} />
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索商品、标识、分类"
            className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 md:w-80"
          />
          <SubmitButton
            pendingLabel="搜索中..."
            className="h-10 rounded-md border border-neutral-200 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            搜索
          </SubmitButton>
          {q ? (
            <Link
              href="/admin/products"
              className="px-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
            >
              清除
            </Link>
          ) : null}
        </form>
        <BulkDeleteButton
          form={bulkFormId}
          label="批量删除"
          message="确定删除选中的商品？"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-[0.1em] text-neutral-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <SelectAllCheckbox form={bulkFormId} name="ids" />
              </th>
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
                  <input
                    type="checkbox"
                    form={bulkFormId}
                    name="ids"
                    value={p.id}
                    aria-label={`选择商品 ${p.title}`}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                </td>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        href={(nextPage) => productPageHref(nextPage, query)}
      />
    </div>
  )
}

function pageNumber(value?: string) {
  const page = Number.parseInt(value || "1", 10)

  return Number.isFinite(page) && page > 0 ? page : 1
}

function productPageHref(
  page: number,
  query?: { error?: string; imported?: string; q?: string }
) {
  const params = new URLSearchParams()

  if (query?.error) params.set("error", query.error)
  if (query?.imported) params.set("imported", query.imported)
  if (query?.q) params.set("q", query.q)
  if (page > 1) params.set("page", String(page))

  const queryString = params.toString()
  return queryString ? `/admin/products?${queryString}` : "/admin/products"
}

function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number
  totalPages: number
  href: (page: number) => string
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      <Link
        href={href(Math.max(1, page - 1))}
        className={`rounded-md border border-neutral-200 px-3 py-2 ${
          page <= 1
            ? "pointer-events-none text-neutral-300"
            : "text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        上一页
      </Link>
      <span className="text-neutral-500">
        第 {Math.min(page, totalPages)} / {totalPages} 页
      </span>
      <Link
        href={href(Math.min(totalPages, page + 1))}
        className={`rounded-md border border-neutral-200 px-3 py-2 ${
          page >= totalPages
            ? "pointer-events-none text-neutral-300"
            : "text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        下一页
      </Link>
    </div>
  )
}
