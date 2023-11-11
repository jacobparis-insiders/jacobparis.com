import { Transition } from "@headlessui/react"

export function FadeIn({
  className = "",
  show = true,
  children,
}: {
  className?: string
  show?: boolean
  children: React.ReactNode
}) {
  // className="duration-0 transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={show}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}

export function FadeInUp({
  className = "",
  show = true,
  children,
}: {
  className?: string
  show?: boolean
  children: React.ReactNode
}) {
  // className="duration-0 transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={show}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}
