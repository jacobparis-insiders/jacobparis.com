import { LinkIcon } from "@heroicons/react/24/outline"
import { ExternalLink } from "~/components/ExternalLink"

export function FakeBrowser({ href, title, children, className = "" }) {
  return (
    <div
      className={`not-prose overflow-hidden rounded-b rounded-t-xl bg-white ${className}`}
    >
      <div className="flex h-8 items-center justify-between border bg-gray-100 px-4 ">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full border border-red-600 border-opacity-30 bg-red-500" />
          <div className="h-3 w-3 rounded-full border border-yellow-600 border-opacity-30 bg-yellow-500" />
          <div className="h-3 w-3 rounded-full border border-green-600 border-opacity-30 bg-green-500" />
        </div>
        <div className="flex space-x-2 text-gray-700">
          <ExternalLink
            href={href}
            className="flex items-center gap-x-2 rounded px-2 font-semibold hover:bg-gray-200"
          >
            <LinkIcon className="h-4 w-4" />
            Visit {title}
          </ExternalLink>
        </div>
      </div>

      {children}
    </div>
  )
}
