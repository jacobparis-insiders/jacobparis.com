import { useEffect, useState } from "react"
import { ClientOnly } from "remix-utils/client-only"
import { ProgressiveClientOnly } from "../ProgressiveClientOnly.tsx"

export function DateExamples() {
  const serverDate = new Date("2023-01-01")
  const [fakeDate, setFakeDate] = useState(serverDate.toLocaleDateString())

  useEffect(() => {
    setFakeDate(new Date().toLocaleDateString())
  }, [])
  return (
    <div className="grid grid-cols-2 gap-4 text-base">
      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> With JS </span>
          <input
            type="text"
            defaultValue={fakeDate}
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </div>
      <ProgressiveClientOnly className="animate-fade">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive with JS
          </span>
          <input
            type="text"
            defaultValue={fakeDate}
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </ProgressiveClientOnly>

      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> Without JS</span>
          <input
            type="text"
            className="rounded border border-gray-300 px-4 py-2 "
            defaultValue={serverDate.toLocaleDateString()}
          />
        </label>
      </div>

      <div className="animate-appear">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive without JS
          </span>
          <input
            type="text"
            defaultValue={serverDate.toLocaleDateString()}
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </div>
    </div>
  )
}

export function LocalStorageExamples() {
  const [fakeLocalStorageValue, setFakeLocalStorageValue] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLocalStorageValue("value from local storage")
    }, 100)

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="grid grid-cols-2 gap-4 text-base">
      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> With JS </span>
          <input
            type="text"
            defaultValue={fakeLocalStorageValue}
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </div>
      <ProgressiveClientOnly className="animate-fade">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive with JS
          </span>
          <input
            type="text"
            defaultValue={fakeLocalStorageValue}
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </ProgressiveClientOnly>

      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> Without JS</span>
          <input
            type="text"
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </div>

      <div className="animate-appear">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive without JS
          </span>
          <input
            type="text"
            className="rounded border border-gray-300 px-4 py-2 "
          />
        </label>
      </div>
    </div>
  )
}

export function FileExamples() {
  return (
    <div className="grid grid-cols-2 gap-4 text-base">
      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> With JS </span>
          <ClientOnly fallback={<input type="file" />}>
            {() => (
              <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
                Fake file drop
              </div>
            )}
          </ClientOnly>
        </label>
      </div>
      <label className="flex flex-col">
        <span className="mb-1 text-sm text-gray-500">Progressive with JS</span>
        <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
          Fake file drop
        </div>
        <ProgressiveClientOnly className="sr-only">
          <input type="file" />
        </ProgressiveClientOnly>
      </label>

      <div>
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500"> Without JS</span>
          <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
            Fake file drop
          </div>
          <input type="file" />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="mb-1 text-sm text-gray-500">
          Progressive without JS
        </span>
        <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
          Fake file drop
        </div>
        <div className="animate-appear">
          <input type="file" />
        </div>
      </label>
    </div>
  )
}
