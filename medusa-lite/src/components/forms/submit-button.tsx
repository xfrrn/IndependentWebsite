"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"
import { useFormStatus } from "react-dom"

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: ReactNode
}

export default function SubmitButton({
  children,
  className = "",
  disabled,
  pendingLabel = "处理中...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
