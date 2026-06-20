import Link from "next/link"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "□" },
  { href: "/admin/products", label: "Products", icon: "☷" },
  { href: "/admin/categories", label: "Categories", icon: "⊞" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="w-56 border-r border-neutral-200 bg-white p-4">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">Admin</h2>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
