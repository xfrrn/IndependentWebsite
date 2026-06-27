"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"

export function DeleteButton({
  label,
  message,
}: {
  label: string
  message: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      disabled={pending}
      aria-busy={pending}
      className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault()
        }
      }}
    >
      {pending ? "删除中..." : label}
    </button>
  )
}

export function BulkDeleteButton({
  form,
  label,
  message,
}: {
  form: string
  label: string
  message: string
}) {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      aria-busy={pending}
      className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault()
          return
        }

        setPending(true)
      }}
    >
      {pending ? "删除中..." : label}
    </button>
  )
}

export function SelectAllCheckbox({
  form,
  name,
}: {
  form: string
  name: string
}) {
  return (
    <input
      type="checkbox"
      aria-label="全选"
      className="h-4 w-4 rounded border-neutral-300"
      onChange={(event) => {
        document
          .querySelectorAll<HTMLInputElement>(
            `input[form="${form}"][name="${name}"]`
          )
          .forEach((checkbox) => {
            checkbox.checked = event.currentTarget.checked
          })
      }}
    />
  )
}
