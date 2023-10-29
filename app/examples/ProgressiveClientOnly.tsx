import { useHydrated } from "remix-utils/use-hydrated"

export function ProgressiveClientOnly({
  children,
  className = "",
}: {
  children: React.ReactNode | (() => React.ReactNode)
  className: string
}) {
  const isHydrated = useHydrated()

  return (
    <div
      className={
        isHydrated ? className : "animate-appear" // Appear suddenly after 1s
      }
    >
      {typeof children === "function" ? children() : children}
    </div>
  )
}
