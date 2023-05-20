import * as React from "react"

export function Highlight({ children }: { children?: React.ReactNode }) {
  if (!children) {
    return null
  }

  return (
    <span className="-mx-1 bg-yellow-100 py-2 px-1 text-gray-700">
      {" "}
      {children}{" "}
    </span>
  )
}
