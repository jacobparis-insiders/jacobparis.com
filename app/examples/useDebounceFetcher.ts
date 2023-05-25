import type { SubmitOptions } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import { useEffect, useRef } from "react"

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | {
      [name: string]: string
    }
  | null

type DebounceSubmitFunction = (
  target: SubmitTarget,
  argOptions?: SubmitOptions & { debounceTimeout?: number },
) => void

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

/**
 * @tutorial https://www.jacobparis.com/content/use-debounce-fetcher
 */
export function useDebounceFetcher<T = any>() {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // no initialize step required since timeoutRef defaults undefined
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [timeoutRef])

  const fetcher = useFetcher<T>() as ReturnType<typeof useFetcher<T>> & {
    debounceSubmit?: DebounceSubmitFunction
  }

  fetcher.debounceSubmit = (target, argOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const { debounceTimeout = 0, ...options } = argOptions || {}

    if (debounceTimeout && debounceTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        fetcher.submit(target, options)
      }, debounceTimeout)
    } else {
      fetcher.submit(target, options)
    }
  }

  return fetcher as WithRequiredProperty<typeof fetcher, "debounceSubmit">
}
