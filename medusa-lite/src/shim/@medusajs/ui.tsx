import React from "react"

// clsx re-export
export { default as clx } from "clsx"

// Container - simple div
export const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>{children}</div>
))
Container.displayName = "Container"

// Text - simple p/span
export const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { className?: string; as?: "p" | "span" }
>(({ className, children, as: Tag = "p", ...props }, ref) => (
  <Tag ref={ref} className={className} {...props}>{children}</Tag>
))
Text.displayName = "Text"

// Button
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string
    variant?: string
    isLoading?: boolean
    disabled?: boolean
    "data-testid"?: string
  }
>(({ className, children, variant, isLoading, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={className}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? "..." : children}
  </button>
))
Button.displayName = "Button"

// Label
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <label ref={ref} className={className} {...props}>{children}</label>
))
Label.displayName = "Label"

// RadioGroup - simple div wrapping radio options
export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string; value?: string }
>(({ className, children, value, ...props }, ref) => (
  <div ref={ref} className={className} role="radiogroup" {...props}>{children}</div>
))
RadioGroup.displayName = "RadioGroup"

// useToggleState hook stub
export function useToggleState() {
  return {
    state: false,
    open: () => {},
    close: () => {},
    toggle: () => {},
  }
}
