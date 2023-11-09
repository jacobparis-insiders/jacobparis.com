import { useEffect, useState } from "react"
import { ClientOnly } from "remix-utils/client-only"
import { ProgressiveClientOnly } from "../ProgressiveClientOnly.tsx"
import { Button } from "#app/components/ui/button.tsx"

function RefreshDemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-md bg-white p-4 shadow-sm">
      <div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            // the JS reload retains the scroll position
            window.location.reload()
          }}
        >
          <Button size="xs"> Refresh </Button>{" "}
        </form>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function DateExamples() {
  const serverDate = new Date("2023-01-01")
  const [fakeDate, setFakeDate] = useState(serverDate.toLocaleDateString())

  useEffect(() => {
    setFakeDate(new Date().toLocaleDateString())
  }, [])
  return (
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
        <div>
          <label className="flex flex-col">
            <span className="mb-1 text-sm text-gray-500">
              {" "}
              Regular without JS
            </span>
            <input
              type="text"
              className="rounded border border-gray-300 px-4 py-2 "
              defaultValue={serverDate.toLocaleDateString()}
            />
          </label>
        </div>

        <div>
          <label className="flex flex-col">
            <span className="mb-1 text-sm text-gray-500">
              {" "}
              Regular with JS{" "}
            </span>
            <input
              type="text"
              defaultValue={fakeDate}
              className="rounded border border-gray-300 px-4 py-2 "
            />
          </label>
        </div>
      </div>
    </RefreshDemoFrame>
  )
}

export function ProgressiveDateExamples() {
  const serverDate = new Date("2023-01-01")
  const [fakeDate, setFakeDate] = useState(serverDate.toLocaleDateString())

  useEffect(() => {
    setFakeDate(new Date().toLocaleDateString())
  }, [])

  return (
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
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
      </div>
    </RefreshDemoFrame>
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
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
        <div>
          <label className="flex flex-col">
            <span className="mb-1 text-sm text-gray-500">
              {" "}
              Regular without JS
            </span>
            <input
              type="text"
              className="rounded border border-gray-300 px-4 py-2 "
            />
          </label>
        </div>

        <div>
          <label className="flex flex-col">
            <span className="mb-1 text-sm text-gray-500">
              {" "}
              Regular with JS{" "}
            </span>
            <input
              type="text"
              defaultValue={fakeLocalStorageValue}
              className="rounded border border-gray-300 px-4 py-2 "
            />
          </label>
        </div>
      </div>
    </RefreshDemoFrame>
  )
}

export function ProgressiveLocalStorageExamples() {
  const [fakeLocalStorageValue, setFakeLocalStorageValue] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLocalStorageValue("value from local storage")
    }, 100)

    return () => clearTimeout(timer)
  }, [])
  return (
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
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
      </div>
    </RefreshDemoFrame>
  )
}

export function FileExamples() {
  return (
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
        <div>
          <label className="flex flex-col">
            <span className="mb-1 text-sm text-gray-500"> Without JS</span>
            <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
              Fake file drop
            </div>
            <input type="file" />
          </label>
        </div>

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
      </div>
    </RefreshDemoFrame>
  )
}

export function ProgressiveFileExamples() {
  return (
    <RefreshDemoFrame>
      <div className="grid grid-cols-2 gap-4 text-base">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive without JS
          </span>
          <div className="animate-disappear">
            <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
              Fake file drop
            </div>
          </div>
          <div className="animate-appear">
            <input type="file" />
          </div>
        </label>

        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-500">
            Progressive with JS
          </span>
          <ProgressiveClientOnly defaultShow={true}>
            <div className="rounded border border-gray-300 bg-gray-50 px-4 py-2">
              Fake file drop
            </div>
          </ProgressiveClientOnly>
          <ProgressiveClientOnly className="sr-only">
            <input type="file" />
          </ProgressiveClientOnly>
        </label>
      </div>
    </RefreshDemoFrame>
  )
}
