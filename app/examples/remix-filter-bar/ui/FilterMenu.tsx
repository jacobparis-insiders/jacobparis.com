/**
 * This is the menu that lets the user select which filters they want to apply
 */
import { Form } from "@remix-run/react"

import { Icon } from "~/components/icon"
import {
  MenuProvider,
  Submenu,
  SubmenuSlot,
  ButtonItem as ButtonItemCore,
  SubmenuTrigger as SubmenuTriggerCore,
} from "~/components/Submenu"

import { Command, CommandList, CommandItem } from "~/components/ui/command"

import { useFilterSearch } from "../useFilterSearch"
import { useFilterData } from "../content.remix-filter-bar.__filter.route"

export function FilterMenu({ path }: { path?: string }) {
  const { replaceFilter } = useFilterSearch()
  const { filterTypes } = useFilterData()

  return (
    <MenuProvider defaultPath={path}>
      <Form method="GET">
        <Command className="[&_hr+hr]:hidden [&_hr:first-child]:hidden [&_hr:last-child]:hidden">
          <div>
            <CommandList>
              <CheckboxFilterMenu
                name="status"
                label={filterTypes["status"].label}
                values={filterTypes["status"].values}
              />

              <CheckboxFilterMenu
                name="assigneeId"
                label={filterTypes["assigneeId"].label}
                values={filterTypes["assigneeId"].values}
              />

              <CheckboxFilterMenu
                name="creatorId"
                label={filterTypes["creatorId"].label}
                values={filterTypes["creatorId"].values}
              />

              <CheckboxFilterMenu
                name="priority"
                label={filterTypes["priority"].label}
                values={filterTypes["priority"].values}
              />

              <CheckboxFilterMenu
                name="labels"
                label={filterTypes["labels"].label}
                values={filterTypes["labels"].values}
              />

              <InputFilterMenu
                name="content"
                label={filterTypes["content"].label}
              />

              <hr />

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "isParent",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["isParent"].label}
              </ButtonItem>

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "isChild",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["isChild"].label}
              </ButtonItem>

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "isBlocked",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["isBlocked"].label}
              </ButtonItem>

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "isBlocking",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["isBlocking"].label}
              </ButtonItem>

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "hasReferences",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["hasReferences"].label}
              </ButtonItem>

              <ButtonItem
                onSelect={() => {
                  return replaceFilter({
                    subject: "hasDuplicates",
                    operator: "eq",
                    values: ["true"],
                  })
                }}
              >
                {filterTypes["hasDuplicates"].label}
              </ButtonItem>
              <hr />

              <DateFilterMenu
                name="dueDate"
                label={filterTypes["dueDate"].label}
              />

              <DateFilterMenu
                name="createdDate"
                label={filterTypes["createdDate"].label}
              />

              <DateFilterMenu
                name="updatedDate"
                label={filterTypes["updatedDate"].label}
              />

              <DateFilterMenu
                name="startedDate"
                label={filterTypes["startedDate"].label}
              />

              <DateFilterMenu
                name="triagedDate"
                label={filterTypes["triagedDate"].label}
              />
            </CommandList>
          </div>
        </Command>
      </Form>
    </MenuProvider>
  )
}

function InputFilterMenu({ name, label }: { name: string; label: string }) {
  const { replaceFilter } = useFilterSearch()

  return (
    <Submenu name={name}>
      <SubmenuTrigger>{label}</SubmenuTrigger>

      <SubmenuSlot>
        <input
          className="border-input focus-visible:ring-ring flex h-10  w-full rounded-md  px-3 py-2 text-sm  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(event) => {
            const value = event.target.value

            return replaceFilter({
              subject: name,
              operator: "eq",
              values: [value],
            })
          }}
        />
      </SubmenuSlot>
    </Submenu>
  )
}

function DateFilterMenu({ name, label }: { name: string; label: string }) {
  const { replaceFilter } = useFilterSearch()

  return (
    <Submenu name={name}>
      <SubmenuTrigger>{label}</SubmenuTrigger>

      <SubmenuSlot>
        <input
          type="date"
          className="border-input focus-visible:ring-ring flex h-10  w-full rounded-md  px-3 py-2 text-sm  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(event) => {
            const value = event.target.value

            return replaceFilter({
              subject: name,
              operator: "eq",
              values: [value],
            })
          }}
        />
      </SubmenuSlot>
    </Submenu>
  )
}

export function CheckboxFilterMenu({
  name,
  label,
  values,
}: {
  name: string
  label: string
  values: ReadonlyArray<{
    value: string
    label: string
  }>
}) {
  const { filters, replaceFilter } = useFilterSearch()
  const matchingFilter = filters.find((filter) => filter.subject === name)
  const checkedValues = matchingFilter ? matchingFilter.values : []

  return (
    <Submenu name={name}>
      <SubmenuTrigger>{label}</SubmenuTrigger>

      <SubmenuSlot>
        {values.map(({ value, label }) => (
          <CommandItem
            key={value}
            onSelect={() => {
              const nextValues = checkedValues.includes(value)
                ? checkedValues.filter(
                    (existingValue) => existingValue !== value,
                  )
                : [...checkedValues, value]

              return replaceFilter({
                subject: name,
                operator: "eq",
                values: nextValues,
              })
            }}
            className="m-1"
          >
            <div
              data-state={checkedValues.includes(value) ? "checked" : undefined}
              className="peer mr-2 h-4 w-4 shrink-0 overflow-hidden rounded-sm border border-neutral-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-neutral-50"
            >
              {checkedValues.includes(value) ? (
                <Icon name="check" className="block h-full w-full" />
              ) : null}
            </div>
            {label}
          </CommandItem>
        ))}
      </SubmenuSlot>
    </Submenu>
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
