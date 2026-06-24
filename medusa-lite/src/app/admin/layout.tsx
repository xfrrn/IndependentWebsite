import Link from "next/link"
import { cookies } from "next/headers"

import { logoutAdmin } from "./auth-actions"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"

const NAV_ITEMS = [
  { href: "/admin", label: "概览", icon: "D" },
  { href: "/admin/products", label: "商品", icon: "P" },
  { href: "/admin/categories", label: "分类", icon: "C" },
  { href: "/admin/content", label: "内容", icon: "T" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthed = await isAdminSessionToken(
    cookieStore.get(ADMIN_AUTH_COOKIE)?.value
  )

  if (!isAuthed) {
    return children
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="w-56 border-r border-neutral-200 bg-white p-4">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">后台</h2>
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
        <form action={logoutAdmin} className="mt-6">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100">
            退出登录
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
