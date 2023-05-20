import type { LinkHTMLAttributes } from "react"

export function ExternalLink(props: LinkHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener" {...props} />
}
