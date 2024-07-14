import { useState } from "react"
import { Icon } from "../icon.tsx"
import { Button } from "./button.tsx"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx"
import { ScrollArea } from "./scroll-area.tsx"
import { cn } from "#app/utils/misc.ts"

export type ComboboxOptions = {
  value: string
  label: string
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
}: {
  id?: string
  name: string
  createName?: string
  createLabel?: string
  options: Array<ComboboxOptions>
  className?: string
  placeholder?: string
  defaultValue?: Array<string>
}) {
  const [value, setValue] = useState<Array<string>>(defaultValue)
  const [prevOptions, setPrevOptions] = useState(options)
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

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState<string>("")

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
            className="w-full justify-between px-3"
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
