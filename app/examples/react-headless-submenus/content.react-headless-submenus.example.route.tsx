// http://localhost:3000/content/react-headless-submenus/example

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useState } from "react"
import {
  Submenu,
  ButtonItem as ButtonItemCore,
  SubmenuTrigger as SubmenuTriggerCore,
  MenuProvider,
} from "../../components/Submenu"
export { mergeHeaders as headers } from "~/utils/misc"

export async function loader({ request }: LoaderArgs) {
  return json({})
}

export default function Example() {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState<string[]>([])

  return (
    <div className="mx-auto max-w-[600px]">
      <h1 className="bold mb-4 text-2xl">React submenus</h1>

      <p className="mb-4">Click the button to open the menu</p>

      <button
        onClick={() => setOpen((open) => !open)}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Open menu
      </button>
      {open ? (
        <div className="relative">
          <div className="absolute left-0 top-0 flex max-w-[15rem] flex-col border bg-gray-100 py-2">
            <Menu
              on={(value) => setActions((actions) => [...actions, value])}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-24">
        <h2 className="bold mb-4 text-2xl">Actions</h2>
        <ul className="list-inside list-disc">
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SubmenuExample() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-10 py-4  text-base">
      <button
        onClick={() => setOpen((open) => !open)}
        className="inline-flex h-10 min-w-[10rem] items-center justify-center rounded-md border border-neutral-200/60 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 ring-offset-white transition-colors hover:bg-neutral-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
      >
        {open ? "Close" : "Open"} menu
      </button>
      {open ? (
        <div className="relative">
          <div className="absolute left-0 top-2 flex min-w-[10rem] flex-col rounded-md border  border-neutral-200/60 bg-neutral-100  py-2">
            <Menu on={(item) => console.log(item)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Menu({ on }: { on: (value: string) => void }) {
  return (
    <MenuProvider>
      <ButtonItem onSelect={() => on("bold")}>Bold</ButtonItem>
      <ButtonItem onSelect={() => on("italic")}>Italic</ButtonItem>
      <ButtonItem onSelect={() => on("underline")}>Underline</ButtonItem>
      <ButtonItem onSelect={() => on("strike")}>Strikethrough</ButtonItem>

      <Submenu name="align">
        <SubmenuTrigger>Align</SubmenuTrigger>

        <ButtonItem onSelect={() => on("Align left")}>Left</ButtonItem>
        <ButtonItem onSelect={() => on("Align center")}>Center</ButtonItem>
        <ButtonItem onSelect={() => on("Align right")}>Right</ButtonItem>
        <ButtonItem onSelect={() => on("Align justify")}>Justify</ButtonItem>
      </Submenu>

      <Submenu name="styles">
        <SubmenuTrigger>Styles</SubmenuTrigger>

        <ButtonItem onSelect={() => on("Heading 1")}>Heading 1</ButtonItem>
        <ButtonItem onSelect={() => on("Heading 2")}>Heading 2</ButtonItem>
        <ButtonItem onSelect={() => on("Heading 3")}>Heading 3</ButtonItem>
        <ButtonItem onSelect={() => on("Heading 4")}>Heading 4</ButtonItem>
        <ButtonItem onSelect={() => on("Heading 5")}>Heading 5</ButtonItem>
        <ButtonItem onSelect={() => on("Heading 6")}>Heading 6</ButtonItem>
      </Submenu>

      <Submenu name="spacing">
        <SubmenuTrigger>Spacing</SubmenuTrigger>

        <ButtonItem onSelect={() => on("Single space")}>Single</ButtonItem>
        <ButtonItem onSelect={() => on("Double space")}>Double</ButtonItem>

        <Submenu name="custom">
          <SubmenuTrigger>Custom</SubmenuTrigger>

          <ButtonItem onSelect={() => on("1.0")}>1.0</ButtonItem>
          <ButtonItem onSelect={() => on("1.5")}>1.5</ButtonItem>
          <ButtonItem onSelect={() => on("2.0")}>2.0</ButtonItem>
        </Submenu>
      </Submenu>
    </MenuProvider>
  )
}

export function SubmenuTrigger({ children }: { children: React.ReactNode }) {
  return (
    <SubmenuTriggerCore className="flex justify-between px-4 py-2 text-left hover:bg-neutral-200">
      <span>{children}</span>
      <span>▶</span>
    </SubmenuTriggerCore>
  )
}

export function ButtonItem({
  children,
  onSelect,
}: {
  onSelect?: () => void
  children: React.ReactNode
}) {
  return (
    <ButtonItemCore
      className="px-4 py-2 text-left hover:bg-neutral-200"
      onSelect={onSelect}
    >
      {children}
    </ButtonItemCore>
  )
}
