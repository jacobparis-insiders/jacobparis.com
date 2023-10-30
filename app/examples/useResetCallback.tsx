import { useState } from "react"

/**
 * @tutorial https://www.jacobparis.com/content/use-reset-callback
 */
export function useResetCallback<T>(initialValue: T, resetFn: () => any) {
  const [prevValue, setPrevValue] = useState<T>(initialValue)
  if (prevValue !== initialValue) {
    resetFn()
    setPrevValue(initialValue)
  }
}
