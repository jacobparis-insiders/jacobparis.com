import * as React from "react"
import { Button } from "#app/components/ui/button.tsx"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#app/components/ui/command.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#app/components/ui/popover.tsx"
import { ScrollArea } from "#app/components/ui/scroll-area.tsx"
import { Icon } from "#app/components/icon.tsx"
import { cn } from "#app/utils/misc.ts"

export type ComboboxOptions = {
  value: string
  label: string
}

type ComboboxPropsBase = {
  id?: string
  name: string
  createName?: string
  createLabel?: string
  options: ComboboxOptions[]
  className?: string
  placeholder?: string
}

export function Combobox(
  props: ComboboxPropsBase &
    (
      | { mode: "multiple"; defaultValue?: string[] }
      | { mode?: "single"; defaultValue?: string }
    ),
) {
  return props.mode === "multiple" ? (
    <ComboboxMultiple {...props} />
  ) : (
    <ComboboxSingle {...props} />
  )
}

export function ComboboxMultiple({
  id,
  name,
  createName,
  createLabel,
  options,
  defaultValue = [],
  className,
  placeholder,
}: ComboboxPropsBase & { defaultValue?: string[] }) {
  const [value, setValue] = React.useState<string[]>(defaultValue)
  const [prevOptions, setPrevOptions] = React.useState(options)
  if (prevOptions !== options) {
    setPrevOptions(options)

    // We create new options by LABEL, not value
    // So when new options come in, set our value to the matching option
    const hasMatchingOption = options.some((item) => value.includes(item.value))
    if (hasMatchingOption) {
      setValue((value) =>
        value.map((value) => {
          const unmatchedOptions = options.filter(
            (option) => !value.includes(option.value),
          )
          const matchingOption = unmatchedOptions.find(
            (option) => option.label === value,
          )

          return matchingOption ? matchingOption.value : value
        }),
      )
    }
  }

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>("")

  const queryMatchesOption =
    query.length > 0 &&
    options
      .map((option) => option.label.toLowerCase())
      .includes(query.trim().toLowerCase())

  const handleSelect = (optionValue: string) => {
    setValue((prevValue) =>
      prevValue.includes(optionValue)
        ? prevValue.filter((item) => item !== optionValue)
        : [...prevValue, optionValue],
    )
  }

  const matchingOptions = options.filter((option) =>
    value.find((item) => item === option.value),
  )
  const unmatchingOptions = value.filter(
    (selectedValue) => !options.find((item) => item.value === selectedValue),
  )

  return (
    <div className={cn(className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-normal"
          >
            {value.length > 0 ? (
              <div className="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
                <span>
                  {matchingOptions.map((option) => option.label).join(", ")}
                  {matchingOptions.map((option) => (
                    <input
                      key={option.value}
                      name={name}
                      type="hidden"
                      value={option.value}
                    />
                  ))}

                  {/* Comma between existing and new values */}
                  {unmatchingOptions.length > 0 ? (
                    <>
                      {matchingOptions.length > 0 ? <span>, </span> : null}
                      <strong>{unmatchingOptions.join(", ")}</strong>
                    </>
                  ) : null}

                  {unmatchingOptions.map((item) => (
                    <input
                      key={`create-${item}`}
                      type="hidden"
                      name={createName}
                      value={item}
                    />
                  ))}
                </span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <Icon
              name="chevron-down"
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />

            <ScrollArea>
              <div className="max-h-80">
                <CommandGroup>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                      >
                        <Icon
                          name="check"
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.includes(option.value)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                    {query.length > 0 && !queryMatchesOption && createName ? (
                      <CommandItem
                        key={`create-${query}`}
                        value={query.trim()}
                        onSelect={() => {
                          setQuery("")
                          setValue((prevValue) => [...prevValue, query.trim()])
                        }}
                      >
                        {createLabel ? (
                          <strong>{createLabel}&nbsp;</strong>
                        ) : null}
                        {query}
                      </CommandItem>
                    ) : null}
                  </CommandList>
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function ComboboxSingle({
  id,
  name,
  createName,
  createLabel,
  options,
  defaultValue,
  className,
  placeholder,
}: ComboboxPropsBase & { defaultValue?: string }) {
  const [value, setValue] = React.useState<string | undefined>(defaultValue)
  const [prevOptions, setPrevOptions] = React.useState(options)
  if (prevOptions !== options) {
    setPrevOptions(options)

    // We create new options by LABEL, not value
    // So when new options come in, set our value to the matching option
    const matchingOption = options.find((item) => item.label === value)
    if (matchingOption) {
      setValue(matchingOption.value)
    }
  }

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>("")

  const matchingOption = options.find((item) => item.value === value)

  const queryMatchesOption =
    query.length > 0 &&
    options
      .map((option) => option.label.toLowerCase())
      .includes(query.trim().toLowerCase())

  return (
    <div className={cn(className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-normal"
          >
            {value ? (
              <div className="relative mr-auto flex flex-grow items-center overflow-hidden">
                <span>
                  {matchingOption ? (
                    <>
                      <span>{matchingOption.label}</span>
                      <input
                        type="hidden"
                        name={name}
                        value={matchingOption.value}
                      />
                    </>
                  ) : createName ? (
                    <>
                      <span>
                        {createLabel ? (
                          <strong>{createLabel}&nbsp;</strong>
                        ) : null}{" "}
                        {value}
                      </span>
                      <input type="hidden" name={createName} value={value} />
                    </>
                  ) : null}
                </span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <Icon
              name="chevron-down"
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />

            <ScrollArea>
              <div className="max-h-80">
                <CommandGroup>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => setValue(option.value)}
                      >
                        <Icon
                          name="check"
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                    {query.length > 0 && !queryMatchesOption && createName ? (
                      <CommandItem
                        key={query}
                        value={query.trim()}
                        onSelect={() => setValue(query.trim())}
                      >
                        {createLabel ? (
                          <strong>{createLabel}&nbsp;</strong>
                        ) : null}
                        {query}
                      </CommandItem>
                    ) : null}
                  </CommandList>
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
