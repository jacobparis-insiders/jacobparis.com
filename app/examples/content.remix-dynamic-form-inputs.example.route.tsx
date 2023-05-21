// http://localhost:3000/content/remix-dynamic-form-inputs/example

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useState } from "react"

declare global {
  var mutedWords: string[]
}

if (!global.mutedWords) {
  global.mutedWords = []
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const mutedWords = formData.getAll("mutedWords[]")
  global.mutedWords = mutedWords.filter(Boolean) as string[]

  return null
}

export async function loader({ request }: LoaderArgs) {
  return json({
    mutedWords: global.mutedWords,
  })
}

export default function Example() {
  const { mutedWords } = useLoaderData<typeof loader>()

  const [inputCount, setInputCount] = useState(mutedWords.length + 1)
  return (
    <div>
      <h1>Example: Dynamic Form Inputs</h1>

      <form method="post">
        <fieldset>
          <legend>Muted words</legend>
          {Array.from({ length: inputCount }, (_, i) => {
            return (
              <div key={i}>
                <input
                  type="text"
                  name="mutedWords[]"
                  defaultValue={mutedWords[i]}
                />
              </div>
            )
          })}
          <button
            type="button"
            aria-label="Add another word"
            onClick={() => setInputCount((inputCount) => inputCount + 1)}
          >
            +
          </button>
        </fieldset>

        <button type="submit">Save</button>
      </form>
    </div>
  )
}
