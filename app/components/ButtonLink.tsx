import { useRef } from "react"
import { useHoverEffect } from "./useHoverEffect"

export function ButtonLink({ children, ...props }) {
  const elementRef = useRef<HTMLAnchorElement>(null)
  const Effect = useHoverEffect({ ref: elementRef })

  return (
    <a
      ref={elementRef}
      {...props}
      className={`translate-0 group relative ${props.className}`}
    >
      <Effect />
      {children}
    </a>
  )
}
