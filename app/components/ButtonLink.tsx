import { useRef } from "react"
import { useHoverEffect } from "./useHoverEffect.tsx"
import type { LinkProps } from "@remix-run/react"
import { Link } from "@remix-run/react"

export function ButtonLink({ children, ...props }: LinkProps) {
  const elementRef = useRef<HTMLAnchorElement>(null)
  const Effect = useHoverEffect({ ref: elementRef })

  return (
    <Link
      ref={elementRef}
      {...props}
      className={`translate-0 group relative ${props.className}`}
    >
      <Effect />
      {children}
    </Link>
  )
}
