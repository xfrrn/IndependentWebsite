import Link from "next/link"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
import { deleteCategory, updateCategory } from "../../edit-actions"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  error?: string
  saved?: string
}>

type JsonRecord = Record<string, unknown>

function jsonRecord(value: unknown): JsonRecord {
  return value && !Array.isArray(value) && typeof value === "object"
    ? (value as JsonRecord)
    : {}
}

export default async function AdminCategoryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: { include: { product: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { rank: "asc" } }),
  ])

  if (!category) notFound()

  const metadata = jsonRecord(category.metadata)
  const image = typeof metadata.image === "string" ? metadata.image : ""
  const metadataWithoutImage = { ...metadata }
  delete metadataWithoutImage.image
  const message =
    query.error === "metadata"
      ? "元数据必须是 JSON 对象。"
      : query.error === "required"
        ? "分类名称和标识不能为空。"
        : query.error === "duplicate"
          ? "标识已存在，请换一个。"
          : query.error === "save"
            ? "保存失败，请检查内容后重试。"
            : query.saved
              ? "已保存。"
              : ""

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-800">
        编辑分类
      </h1>

      {message ? (
        <p className="mb-4 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={updateCategory} className="space-y-6">
          <input type="hidden" name="id" value={category.id} />

          <Section title="基础信息">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="名称" name="name" defaultValue={category.name} />
              <Field
                label="标识"
                name="handle"
                defaultValue={category.handle}
              />
              <Field
                label="排序"
                name="rank"
                type="number"
                defaultValue={String(category.rank)}
              />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  父级分类
                </span>
                <select
                  name="parentId"
                  defaultValue={category.parentId || ""}
                  className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
                >
                  <option value="">无</option>
                  {categories
                    .filter((item) => item.id !== category.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={category.isActive}
              />
              <span className="text-sm text-neutral-700">启用</span>
            </label>
            <Textarea
              label="描述"
              name="description"
              defaultValue={category.description || ""}
            />
          </Section>

          <Section title="媒体和数据">
            <Field label="图片 URL" name="image" defaultValue={image} />
            <Textarea
              label="元数据 JSON"
              name="metadata"
              rows={8}
              defaultValue={JSON.stringify(metadataWithoutImage, null, 2)}
            />
          </Section>

          <button className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
            保存分类
          </button>
        </form>

        <div className="space-y-6">
          <Section title="子分类">
            {category.children.length ? (
              <div className="space-y-2">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/admin/categories/${child.id}`}
                    className="block rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 hover:bg-neutral-50"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">暂无子分类</p>
            )}
          </Section>

          <Section title={`商品（${category.products.length}）`}>
            {category.products.length ? (
              <div className="space-y-2">
                {category.products.map((pc) => (
                  <Link
                    key={pc.productId}
                    href={`/admin/products/${pc.productId}`}
                    className="block rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 hover:bg-neutral-50"
                  >
                    {pc.product.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                此分类下暂无商品
              </p>
            )}
          </Section>
        </div>
      </div>

      <form action={deleteCategory} className="mt-8 border-t border-rose-100 pt-6">
        <input type="hidden" name="id" value={category.id} />
        <button className="rounded-md border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50">
          删除分类
        </button>
      </form>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
      />
    </label>
  )
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string
  name: string
  defaultValue: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
      />
    </label>
  )
}
