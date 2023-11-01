import React, { createContext, useContext, useState } from "react"
import type { AsChildProps } from "./Slot.tsx"
import { Slot } from "./Slot.tsx"
import { createStateContext } from "./createStateContext.tsx"

const [MenuContext, useMenuContext] = createStateContext<string>()
MenuContext.displayName = "MenuContext"

const SubmenuContext = createContext<string>("")
SubmenuContext.displayName = "SubmenuContext"

export function MenuProvider({
  defaultPath = "",
  children,
}: {
  defaultPath?: string
  children: React.ReactNode
}) {
  const state = useState<string>(defaultPath)

  return (
    <MenuContext.Provider value={state}>
      <SubmenuContext.Provider value={""}> {children} </SubmenuContext.Provider>
    </MenuContext.Provider>
  )
}

export function useSubmenuContext() {
  const submenuName = useContext(SubmenuContext)

  if (submenuName === undefined) {
    throw new Error(
      `use${SubmenuContext.displayName} must be used within a ${SubmenuContext.displayName}Provider`,
    )
  }

  return submenuName
}

export function Submenu({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  const submenuName = useSubmenuContext()
  const nestedName = [submenuName, name].filter(Boolean).join(".")

  const [path] = useMenuContext()
  if (!path.startsWith(submenuName)) {
    return null
  }

  return (
    <SubmenuContext.Provider value={nestedName}>
      {children}
    </SubmenuContext.Provider>
  )
}

export function SubmenuSlot({ children }: { children: React.ReactNode }) {
  const [path] = useMenuContext()

  const submenuName = useSubmenuContext()
  if (submenuName !== path) {
    return null
  }

  return <>{children}</>
}

export function ButtonItem({
  asChild,
  ...props
}: AsChildProps<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  onSelect?: () => void
  style?: React.CSSProperties
  className?: string
}) {
  if (asChild) {
    return (
      <SubmenuSlot>
        <Slot {...props} />
      </SubmenuSlot>
    )
  }

  return (
    <SubmenuSlot>
      <button
        {...props}
        onClick={(event) => {
          event.preventDefault()
          props.onSelect?.()
        }}
      />
    </SubmenuSlot>
  )
}

type ButtonProps = AsChildProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  () => void
> & {
  onSelect?: () => void
  style?: React.CSSProperties
  className?: string
}

export function SubmenuTrigger({ asChild, children, ...props }: ButtonProps) {
  const submenuName = useSubmenuContext()
  const [path, setPath] = useMenuContext()
  const parentPath = submenuName.split(".").slice(0, -1).join(".")

  if (path !== parentPath) {
    return null
  }

  if (asChild) {
    return children(() => setPath(submenuName))
  }

  return (
    <button
      {...props}
      onClick={(event) => {
        setPath(submenuName)
        props.onSelect?.()
      }}
    >
      {children}
    </button>
  )
}
