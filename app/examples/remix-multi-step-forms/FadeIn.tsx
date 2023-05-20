import { Transition } from "@headlessui/react"
import * as React from "react"

export function FadeIn({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  // className="transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={true}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
    >
      {children}
    </Transition>
  )
}
