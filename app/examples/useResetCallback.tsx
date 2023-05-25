import { useState } from "react"

/**
 * @tutorial https://www.jacobparis.com/content/use-reset-callback
 */

export function useResetCallback(initialValue, resetFn: () => any) {
  const [prevValue, setPrevValue] = useState(initialValue)
  if (prevValue !== initialValue) {
    resetFn()
    setPrevValue(initialValue)
  }
}
