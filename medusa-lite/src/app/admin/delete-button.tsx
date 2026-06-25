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
