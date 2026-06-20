import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminCategoryDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true, products: { include: { product: true } } },
  })

  if (!category) notFound()

  const metadata = category.metadata as Record<string, string>

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-800">{category.name}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Section title="Details">
            <Field label="Handle" value={category.handle} />
            <Field label="Active" value={category.isActive ? "Yes" : "No"} />
            <Field label="Parent" value={category.parent?.name ?? "None"} />
            <Field label="Children" value={category.children.map((c) => c.name).join(", ") || "None"} />
          </Section>

          {category.description && (
            <Section title="Description">
              <p className="text-sm text-neutral-600">{category.description}</p>
            </Section>
          )}

          <Section title="Metadata">
            {Object.keys(metadata).length === 0 ? (
              <p className="text-sm text-neutral-400">No metadata</p>
            ) : (
              Object.entries(metadata).map(([k, v]) => (
                <Field key={k} label={k} value={typeof v === "string" ? v : JSON.stringify(v)} />
              ))
            )}
          </Section>

          {metadata.image && (
            <Section title="Image">
              <img src={metadata.image} alt={category.name} className="max-h-48 rounded-lg border border-neutral-200" />
            </Section>
          )}
        </div>

        <div>
          <Section title={`Products (${category.products.length})`}>
            {category.products.length === 0 ? (
              <p className="text-sm text-neutral-400">No products in this category</p>
            ) : (
              <div className="space-y-2">
                {category.products.map((pc) => (
                  <a key={pc.productId} href={`/admin/products/${pc.productId}`} className="block rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 hover:bg-neutral-50">
                    {pc.product.title}
                  </a>
                ))}
              </div>
            )}
          </Section>
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
