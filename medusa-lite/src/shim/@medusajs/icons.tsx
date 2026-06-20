import React from "react"

// SVG icon shims replacing @medusajs/icons
const svgWrapper = (path: React.ReactNode, viewBox = "0 0 20 20") =>
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} fill="currentColor" {...props}>
      {path}
    </svg>
  ))

export const ArrowUpRightMini = svgWrapper(
  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
)

export const ArrowRightMini = svgWrapper(
  <path fillRule="evenodd" d="M3.75 10a.75.75 0 01.75-.75h9.69l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
)

export const EllipseMiniSolid = svgWrapper(
  <circle cx="10" cy="10" r="4" />
)

export const XMark = svgWrapper(
  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
)

export const Spinner = svgWrapper(
  <path d="M10 3a7 7 0 017 7h-3a4 4 0 00-4-4V3z" />
)
