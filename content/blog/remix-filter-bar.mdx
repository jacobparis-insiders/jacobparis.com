---
title: Build a server-side filter UI with Remix
description: Create a filter bar that stores its state in the URL. Use the OData query string format to parse and serialize the filters. Create a custom hook to manage the filter state.
tags: Remix
published: true
timestamp: "2023-09-17"
---

When filtering data in a table, you need a UI to let the user select which filters to apply. The simple approach is to show an input and make the user enter it manually in a specific format, but we can do better.

The issue tracking app Linear uses individual components to represent each selected filter, similar to the example below<SideNote>Click the filter to go to an interactive example</SideNote>

<FilterExample />

There are four main pieces to this UI:

- Subject: the relevant field in the database
- Operator: the comparison operator, to show equality, inequality, less than, greater than, etc
- Values: the values to compare the subject to
- A button to delete the filter

This could be represented as a simple component like below

```tsx
<div>
  <div> status </div>

  <select onChange={setOperator}>
    <option> eq </option>
    <option> ne </option>
  </select>

  <select onChange={replaceFilter}>
    <option> todo </option>
    <option> in-progress </option>
    <option> done </option>
  </select>

  <button onClick={deleteFilter}>
    <Icon name="cross" />
  </button>
</div>
```

The user has three possible interactions with this component that either modify its operator, its values, or delete it outright.

## Store your selected filters in the URL

When it comes to database filtering, many devs start with a client-side solution and plan to move it to the server later as the app grows.

This is sometimes okay, especially with small datasets, but with Remix, it's actually easier to do it on the server in the first place.

Rather than using client side state management to track which filters are applied, [the only state management you need is the URL](/content/url-as-state-management#sharable-forms-and-filters).

Your database already knows how to sort, paginate, and filter data. You just need to get your choices from the client to the server.

The OData spec is the closest thing to a standard querystring format for this, and you can [use OData to serialize your filter](/content/odata-filtering) and to parse it server-side.

## Parsing the URL

With an OData query string in the URL, you can use the `odata-qs` package to parse it into a tree of objects that are easier to work with.

```yml
?$filter=assignee eq @me and (status eq todo or status eq done)
```

Use Remix's `useSearchParams` hook to access the query string, and then get the parsed query with `parse(searchParams.get("$filter"))`.

The result will be in this structure

```ts
const filterMap = {
  assignee: {
    eq: {
      subject: "assignee",
      operator: "eq",
      values: ["@me"],
    },
  },
  status: {
    eq: {
      subject: "status",
      operator: "eq",
      values: ["todo", "done"],
    },
  },
}
```

Accessing these filters by key is useful for server-side filtering of data, but we don't need that in the front-end, so use the `getValuesFromMap(filterMap)` function to turn it into an array.

```ts
const filters = [
  { subject: "assignee", operator: "eq", values: ["@me"] },
  { subject: "status", operator: "eq", values: ["todo", "done"] },
]
```

Now it's in a format that's easy to work with. You will be loop directly through this array to render the components in the filter bar.

Then, if you make any changes to the filters, you can use `stringify(filters)` to turn it back into an OData query string.

## Create a custom hook to manage the filter state

The above logic is a good candidate for a reusable custom hook An API similar to useState is flexible enough to handle most use-cases.

```tsx
const [filters, setFilters] = useFilterSearch()
```

You can implement it using the `useSearchParams` hook and the functions from `odata-qs` to wrap the query string in a more convenient API.

```tsx
export function useFilterSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get("$filter")

  const filters = getValuesFromMap(parse(query))

  const setFilters = useCallback(
    (fn: (input: FilterExpression[]) => FilterExpression[]) => {
      return setSearchParams((prev) => {
        const query = stringify(fn(filters))

        if (query) {
          prev.set("$filter", query)
        } else {
          prev.delete("$filter")
        }

        return prev
      })
    },
    [filters, setSearchParams],
  )

  return [filters, setFilters] as const
}
```

## Using setFilters for common interactions

You can delete a filter by looping through the array and removing the matching item. If we mandate there will only be one filter per subject, we can use the subject as a key.

```tsx
function deleteFilter(subject: string) {
  setFilters((filters) =>
    filters.filter((filter) => filter.subject !== subject),
  )
}
```

If you are searching for issues where the status is "todo" and you want to invert it to search for issues where the status is not "todo", then you need to change the operator from "eq" to "ne".

There are many ways to do this, but mapping the array and only changing it if the subject matches feels good to me.

```tsx
function setOperator(subject: string, operator: string) {
  setFilters((filters) =>
    filters.map((filter) => {
      if (filter.subject === subject) {
        return { ...filter, operator }
      }
      return filter
    }),
  )
}
```

Creating new filters is a little more complicated because we have to check if a filter already exists for the subject. If it does, we can add the value to the existing filter. If not, we can create a new filter.

This is more of an upsert operation, and it will let you change both the operator and values of a filter all at once.

```tsx
function replaceFilter({ subject, operator, values }: FilterExpression) {
  setFilters((filters) => {
    const existingFilter = filters.find((filter) => filter.subject === subject)

    if (existingFilter) {
      return filters.map((filter) => {
        if (filter.subject === subject) {
          return { ...filter, values }
        }
        return filter
      })
    }

    return [...filters, { subject, operator, values }]
  })
}
```

Depending on your preference, you could include all of these functions in the `useFilterSearch` hook by returning an object instead of an array.

```diff
- return [filters, setFilters] as const
+ return {
+   filters,
+   setFilters,
+   deleteFilter,
+   setOperator,
+   replaceFilter,
+ }
```

## Creating the filter bar

With hooks to both read and write the filter state, you can create a filter bar component that renders the filters and provides the UI to interact with them.

This example will use the Popover component from `shadcn/ui`, as there isn't a simpler

```tsx
function FilterBar() {
  const { filters, deleteFilter, setOperator, replaceFilter } =
    useFilterSearch()

  return (
    <div>
      {filters.map((filter) => (
        <div key={filter.subject}>
          <div> {filter.subject} </div>

          <PopoverMenu label={filter.operator}>
            <Command>
              {/* Operators may change depending on the subject */}
              {["eq", "ne"].map((operator) => (
                <CommandItem
                  key={operator}
                  value={operator}
                  onSelect={() => {
                    setOperator({ subject: filter.subject, operator })
                  }}
                >
                  {operator}
                </CommandItem>
              ))}
            </Command>
          </PopoverMenu>

          <PopoverMenu label={values.join(", ")}>
            {/* Available values will also change depending on the subject */}
            {["todo", "done", "done"].map((value) => (
              <CommandItem
                key={value}
                onSelect={() => {
                  // Toggle the value on click
                  const nextValues = filter.values.includes(value)
                    ? filter.values.filter(
                        (existingValue) => existingValue !== value,
                      )
                    : [...filter.values, value]

                  return replaceFilter({
                    subject: filter.subject,,
                    operator: filter.operator,
                    values: nextValues,
                  })
                }}
                className="m-1"
              >
                {filter.values.includes(value) ? <Icon name="check" /> : null}
                {value}
              </CommandItem>
            ))}
          </PopoverMenu>

          <button onClick={() => deleteFilter(filter.subject)}>
            <Icon name="cross" />
          </button>
        </div>
      ))}
    </div>
  )
}

function PopoverMenu({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild aria-expanded={open} role="combobox">
        <button className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  )
}
```

## Live demo

[View the source code](https://github.com/jacobparis-insiders/jacobparis.com/tree/main/app/examples/remix-filter-bar) or check out the [live demo](/content/remix-filter-bar/example) to see the filter bar in action
