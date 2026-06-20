import { clx } from "@medusajs/ui"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={clx("mt-1 h-px w-full border-b border-[color:var(--border-soft)]", className)}
  />
)

export default Divider
