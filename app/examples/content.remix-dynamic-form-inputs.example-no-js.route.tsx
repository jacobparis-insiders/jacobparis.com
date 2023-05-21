// http://localhost:3000/content/remix-dynamic-form-inputs/example-no-js

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

  return (
    <div>
      <h1>Example: Dynamic Form Inputs</h1>

      <form method="post">
        <fieldset>
          <legend>Muted words</legend>
          {Array.from({ length: mutedWords.length + 1 }, (_, i) => {
            return (
              <div key={i}>
                <input
                  type="text"
                  name="mutedWords[]"
                  autoFocus={i === mutedWords.length}
                  defaultValue={mutedWords[i]}
                />
              </div>
            )
          })}
        </fieldset>

        <button type="submit">Add</button>
      </form>
    </div>
  )
}
