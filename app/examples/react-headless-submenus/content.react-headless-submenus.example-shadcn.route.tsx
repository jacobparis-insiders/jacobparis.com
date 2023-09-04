// http://localhost:3000/content/react-headless-submenus/example-shadcn

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useState } from "react"
import {
  Submenu,
  ButtonItem as ButtonItemCore,
  SubmenuTrigger as SubmenuTriggerCore,
  MenuProvider,
} from "../../components/Submenu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Command, CommandItem, CommandList } from "~/components/ui/command"
export { mergeHeaders as headers } from "~/utils/misc"

export async function loader({ request }: LoaderArgs) {
  return json({})
}

export default function Example() {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState<string[]>([])

  return (
    <div className="mx-auto max-w-[600px]">
      <h1 className="bold mb-4 text-2xl">Submenu with shadcn/ui</h1>

      <p className="mb-4">Click the button to open the menu</p>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild aria-expanded={open} role="combobox">
          <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Open menu
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Menu
            key={open ? "open" : "closed"}
            on={(value) => setActions((actions) => [...actions, value])}
          />
        </PopoverContent>
      </Popover>

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

function Menu({ on }: { on: (value: string) => void }) {
  return (
    <MenuProvider>
      <Command className="[&_hr+hr]:hidden [&_hr:first-child]:hidden [&_hr:last-child]:hidden">
        <CommandList>
          <ButtonItem onSelect={() => on("bold")}>Bold</ButtonItem>
          <ButtonItem onSelect={() => on("italic")}>Italic</ButtonItem>
          <ButtonItem onSelect={() => on("underline")}>Underline</ButtonItem>
          <ButtonItem onSelect={() => on("strike")}>Strikethrough</ButtonItem>

          <Submenu name="align">
            <SubmenuTrigger>Align</SubmenuTrigger>

            <ButtonItem onSelect={() => on("Align left")}>Left</ButtonItem>
            <ButtonItem onSelect={() => on("Align center")}>Center</ButtonItem>
            <ButtonItem onSelect={() => on("Align right")}>Right</ButtonItem>
            <ButtonItem onSelect={() => on("Align justify")}>
              Justify
            </ButtonItem>
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
        </CommandList>
      </Command>
    </MenuProvider>
  )
}

export function SubmenuTrigger({ children }: { children: React.ReactNode }) {
  return (
    <SubmenuTriggerCore asChild>
      {(onSelect) => (
        <CommandItem
          className="m-1 flex justify-between"
          onSelect={() => onSelect()}
        >
          <span>{children}</span>
          <span>▶</span>
        </CommandItem>
      )}
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
    <ButtonItemCore asChild>
      <CommandItem className="m-1" onSelect={onSelect}>
        {children}
      </CommandItem>
    </ButtonItemCore>
  )
}
