import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminProductDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      categories: { include: { category: true } },
      collections: { include: { collection: true } },
    },
  })

  if (!product) notFound()

  const metadata = product.metadata as Record<string, string>

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-800">{product.title}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Section title="Details">
            <Field label="Handle" value={product.handle} />
            <Field label="Status" value={product.status} />
            <Field label="Created" value={new Date(product.createdAt).toLocaleDateString()} />
          </Section>

          <Section title="Description">
            <p className="text-sm text-neutral-600">{product.description || "No description"}</p>
          </Section>

          <Section title="Metadata">
            {Object.keys(metadata).length === 0 ? (
              <p className="text-sm text-neutral-400">No metadata</p>
            ) : (
              Object.entries(metadata).map(([k, v]) => (
                <Field key={k} label={k} value={v} />
              ))
            )}
          </Section>

          <Section title="Categories">
            {product.categories.length === 0 ? (
              <p className="text-sm text-neutral-400">No categories</p>
            ) : (
              product.categories.map((pc) => (
                <span key={pc.categoryId} className="mr-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                  {pc.category.name}
                </span>
              ))
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={`Variants (${product.variants.length})`}>
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v.id} className="rounded-lg border border-neutral-200 p-3">
                  <p className="text-sm font-medium text-neutral-800">{v.title}</p>
                  <p className="text-xs text-neutral-500">SKU: {v.sku || "N/A"}</p>
                  <p className="text-xs text-neutral-500">
                    Price: {((v.calculatedPrice as any)?.calculated_amount ?? 0) / 100} {(v.calculatedPrice as any)?.currency_code?.toUpperCase() ?? ""}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {product.thumbnail && (
            <Section title="Thumbnail">
              <img src={product.thumbnail} alt={product.title} className="rounded-lg border border-neutral-200 max-h-48" />
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="text-xs text-neutral-400">{label}:</span>
      <span className="text-sm text-neutral-700">{value}</span>
    </div>
  )
}
