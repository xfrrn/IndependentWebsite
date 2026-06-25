import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { deleteProduct, updateProduct } from "../../edit-actions"

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

function imageLines(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "string") {
            return item
          }

          if (item && typeof item === "object" && "url" in item) {
            return String(item.url || "")
          }

          return ""
        })
        .filter(Boolean)
        .join("\n")
    : ""
}

function tagsLines(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : ""
}

function priceText(value: unknown) {
  const price = jsonRecord(value)
  const amount =
    typeof price.calculated_amount === "number" ? price.calculated_amount : 0
  const currency =
    typeof price.currency_code === "string"
      ? price.currency_code.toUpperCase()
      : ""

  return `${amount / 100} ${currency}`.trim()
}

export default async function AdminProductDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        categories: { include: { category: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { rank: "asc" } }),
  ])

  if (!product) notFound()

  const selectedCategoryIds = new Set(
    product.categories.map((pc) => pc.categoryId)
  )
  const metadata = jsonRecord(product.metadata)
  const titleZh = typeof metadata.title_zh === "string" ? metadata.title_zh : ""
  const titleAr = typeof metadata.title_ar === "string" ? metadata.title_ar : ""
  const descriptionZh =
    typeof metadata.description_zh === "string" ? metadata.description_zh : ""
  const descriptionAr =
    typeof metadata.description_ar === "string" ? metadata.description_ar : ""
  const metadataWithoutLocalizedTitles = { ...metadata }
  delete metadataWithoutLocalizedTitles.title_zh
  delete metadataWithoutLocalizedTitles.title_ar
  delete metadataWithoutLocalizedTitles.description_zh
  delete metadataWithoutLocalizedTitles.description_ar
  const message =
    query.error === "metadata"
      ? "元数据必须是 JSON 对象。"
      : query.error === "required"
        ? "商品名称和标识不能为空。"
        : query.saved
          ? "已保存。"
          : ""

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-800">
        编辑商品
      </h1>

      {message ? (
        <p className="mb-4 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={updateProduct} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          <Section title="基础信息">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="商品名称" name="title" defaultValue={product.title} />
              <Field
                label="中文名称"
                name="title_zh"
                defaultValue={titleZh}
              />
              <Field
                label="阿拉伯语名称"
                name="title_ar"
                defaultValue={titleAr}
                dir="rtl"
              />
              <Field
                label="标识"
                name="handle"
                defaultValue={product.handle}
              />
              <Field
                label="副标题"
                name="subtitle"
                defaultValue={product.subtitle || ""}
              />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">
                  状态
                </span>
                <select
                  name="status"
                  defaultValue={product.status}
                  className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900"
                >
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </label>
            </div>
            <Textarea
              label="描述"
              name="description"
              defaultValue={product.description || ""}
            />
            <Textarea
              label="中文描述"
              name="description_zh"
              defaultValue={descriptionZh}
            />
            <Textarea
              label="阿拉伯语描述"
              name="description_ar"
              defaultValue={descriptionAr}
              dir="rtl"
            />
          </Section>

          <Section title="媒体和数据">
            <Field
              label="缩略图 URL"
              name="thumbnail"
              defaultValue={product.thumbnail || ""}
            />
            <FileField label="上传缩略图" name="thumbnailFile" />
            <Textarea
              label="图片 URL"
              name="images"
              defaultValue={imageLines(product.images)}
            />
            <FileField label="追加上传商品图片" name="imageFiles" multiple />
            <Textarea
              label="标签"
              name="tags"
              defaultValue={tagsLines(product.tags)}
            />
            <Textarea
              label="元数据 JSON"
              name="metadata"
              rows={8}
              defaultValue={JSON.stringify(metadataWithoutLocalizedTitles, null, 2)}
            />
          </Section>

          <Section title="分类">
            <div className="grid gap-2 md:grid-cols-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                  />
                  <span className="text-sm text-neutral-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <button className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
            保存商品
          </button>
        </form>

        <div className="space-y-6">
          <Section title={`变体（${product.variants.length}）`}>
            <div className="space-y-3">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-lg border border-neutral-200 p-3"
                >
                  <p className="text-sm font-medium text-neutral-800">
                    {variant.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    SKU：{variant.sku || "无"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    价格：{priceText(variant.calculatedPrice)}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <form action={deleteProduct} className="mt-8 border-t border-rose-100 pt-6">
        <input type="hidden" name="id" value={product.id} />
        <button className="rounded-md border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50">
          删除商品
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
  dir,
}: {
  label: string
  name: string
  defaultValue: string
  dir?: "ltr" | "rtl"
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        dir={dir}
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
  dir,
}: {
  label: string
  name: string
  defaultValue: string
  rows?: number
  dir?: "ltr" | "rtl"
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
        dir={dir}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
      />
    </label>
  )
}

function FileField({
  label,
  name,
  multiple = false,
}: {
  label: string
  name: string
  multiple?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        type="file"
        name={name}
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-800"
      />
    </label>
  )
}
