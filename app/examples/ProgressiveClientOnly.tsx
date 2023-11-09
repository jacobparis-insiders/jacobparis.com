import { useHydrated } from "remix-utils/use-hydrated"

export function ProgressiveClientOnly({
  children,
  className = "",
  defaultShow = false,
}: {
  children: React.ReactNode | (() => React.ReactNode)
  className?: string
  defaultShow?: boolean
}) {
  const isHydrated = useHydrated()

  return (
    <div
      className={
        isHydrated
          ? className
          : defaultShow
          ? // Appear or disappear if JS hasn't loaded in 800ms
            "[animation:disappear_800ms]"
          : "[animation:appear_800ms]"
      }
    >
      {typeof children === "function" ? children() : children}
    </div>
  )
}
