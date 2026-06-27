import { loginAdmin } from "../auth-actions"
import { getAdminEmail } from "@/lib/admin-auth"
import SubmitButton from "@components/forms/submit-button"

type SearchParams = Promise<{
  error?: string
  left?: string
  next?: string
}>

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const rawNext = params.next || "/admin"
  const next =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    (rawNext.startsWith("/admin") || rawNext.includes("/content-manager"))
      ? rawNext
      : "/admin"
  const message =
    params.error === "locked"
      ? "连续输错次数过多，请 5 分钟后再试。"
      : params.error === "invalid"
        ? `邮箱或密码错误，还可尝试 ${params.left || 0} 次。`
        : ""

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        action={loginAdmin}
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="next" value={next} />
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">
          后台登录
        </h1>
        {message ? (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        ) : null}
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            邮箱
          </span>
          <input
            name="email"
            type="email"
            defaultValue={getAdminEmail()}
            className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 outline-none focus:border-emerald-600"
            required
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            密码
          </span>
          <input
            name="password"
            type="password"
            className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 outline-none focus:border-emerald-600"
            required
          />
        </label>
        <SubmitButton
          type="submit"
          pendingLabel="登录中..."
          className="h-11 w-full rounded-md bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800"
        >
          登录
        </SubmitButton>
      </form>
    </main>
  )
}
