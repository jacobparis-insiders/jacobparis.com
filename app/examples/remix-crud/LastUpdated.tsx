import { useState } from "react"
import { ProgressiveClientOnly } from "../ProgressiveClientOnly.tsx"
import { useResetCallback } from "../useResetCallback.tsx"

type FalsyType = false | null | undefined | "" | 0
function typedBoolean<ValueType>(
  value: ValueType,
): value is Exclude<ValueType, FalsyType> {
  return Boolean(value)
}

export function LastUpdated(props: {
  dateStrings: string[]
  className?: string
}) {
  const [updatedAt, setUpdatedAt] = useState<string>(
    getLatestDate(props.dateStrings),
  )
  useResetCallback(JSON.stringify(props.dateStrings), () => {
    setUpdatedAt(getLatestDate(props.dateStrings))
  })

  return (
    <div className={props.className || ""}>
      <ProgressiveClientOnly className="animate-fade">
        Last updated {updatedAt}
      </ProgressiveClientOnly>
    </div>
  )
}

function getLatestDate(dateStrings: string[]) {
  const dates = dateStrings
    .filter(typedBoolean)
    .map((data) => new Date(data))
    .sort((a, b) => b.getTime() - a.getTime())

  return dates[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}
