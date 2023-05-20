import { useState } from "react"

export function useResetCallback(initialValue, resetFn: () => any) {
  const [prevValue, setPrevValue] = useState(initialValue)
  if (prevValue !== initialValue) {
    resetFn()
    setPrevValue(initialValue)
  }
}
