"use client"

export function DeleteButton({
  label,
  message,
}: {
  label: string
  message: string
}) {
  return (
    <button
      className="text-sm font-medium text-rose-600 hover:text-rose-700"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault()
        }
      }}
    >
      {label}
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
  return (
    <button
      type="submit"
      form={form}
      className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault()
        }
      }}
    >
      {label}
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
