// http://localhost:3000/writer

import { basicSetup, EditorView } from "codemirror"
import type { EditorState } from "@codemirror/state"
import { useEffect, useRef, useState } from "react"
import { markdown } from "@codemirror/lang-markdown"
import { ClientOnly } from "remix-utils/client-only"
import { inlineSuggestion } from "codemirror-extension-inline-suggestion"
import { useDebounceSubmit } from "remix-utils/use-debounce-submit"

import { json } from "@remix-run/node"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { default as CodeMirror } from "@uiw/react-codemirror/esm/"
import { Button } from "#app/components/ui/button.tsx"

import { Form, useFetchers, useLoaderData } from "@remix-run/react"
import { fetchResource } from "./notes/summary.server.tsx"
import { z } from "zod"
import { parse } from "@conform-to/zod"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { getWebsiteSummary } from "./ai.server.tsx"
import path from "path"
import { flushSync } from "react-dom"
import { readFile, writeFile } from "fs/promises"
import { saveNote } from "./notes/note.server.tsx"
import { cleanUrl } from "./notes/cleanUrl.tsx"

const WriterSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("save_note"),
    url: z.string(),
    content: z.string(),
  }),
  z.object({
    intent: z.literal("save_file"),
    filename: z.string(),
    content: z.string(),
  }),
  z.object({
    intent: z.literal("fetch_website"),
    url: z.string(),
  }),
  z.object({
    intent: z.literal("summarize_note"),
    url: z.string(),
    content: z.string(),
  }),
])

export async function action({ request }: ActionFunctionArgs) {
  const submission = parse(await request.formData(), {
    schema: WriterSchema,
  })

  if (!submission.value) {
    throw new Response("Bad Request", { status: 400 })
  }

  if (submission.value.intent === "save_file") {
    const filename = submission.value.filename
    const pathname = path.resolve("content", "blog", filename)
    writeFileSync(pathname, submission.value.content)

    return json({ status: "success" })
  }

  if (submission.value.intent === "save_note") {
    saveNote(submission.value.url, submission.value.content)

    return json({ status: "success" })
  }

  if (submission.value.intent === "fetch_website") {
    const content = await fetchResource(submission.value.url)

    saveNote(submission.value.url, content)

    return json({ status: "success", content })
  }

  if (submission.value.intent === "summarize_note") {
    const content = await getWebsiteSummary(submission.value.content)

    if (!content) {
      throw new Error("No content found")
    }

    saveNote(submission.value.url, content)

    return json({ status: "success", content })
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const filename = params.filename

  if (!filename) {
    return json({ filename: null, contents: null, links: {} })
  }

  const pathname = path.resolve("content", "blog", filename)
  const contents = readFileSync(pathname, "utf-8")

  return json({
    filename,
    contents,
    links: await getLinks(contents),
  })
}

async function getLinks(text: string) {
  const links = text.match(/https?:\/\/[^\s)]+/g)?.filter((link) => {
    return !link.includes("localhost")
  })

  if (!links) {
    return {}
  }

  const files = await Promise.all(
    links.map(async (link) => {
      const id = cleanUrl(link)
      const pathname = path.resolve("public", "resources", `${id}.txt`)

      if (existsSync(pathname)) {
        return readFile(pathname, "utf-8")
      }

      const content = `# ${id}\n`
      void writeFile(pathname, content)
      return content
    }),
  )

  return Object.fromEntries(
    links.map((link, index) => {
      return [link, files[index]]
    }),
  )
}

export default function Writer() {
  const { filename, contents, links } = useLoaderData<typeof loader>()
  const [defaultContents] = useState(contents)

  const mirrorRef = useRef(null)

  const submit = useDebounceSubmit()
  const fetchers = useFetchers()

  // TODO: Refactor into a useImperativeFetcher hook of some sort
  const suggestionsMap = useRef(new Map<string, string>())
  useEffect(() => {
    const map = suggestionsMap.current

    fetchers
      .filter((fetcher) => fetcher.key.startsWith("writer@"))
      .filter((fetcher) => fetcher.state !== "submitting" && fetcher.data)
      .forEach((fetcher) => {
        map.set(fetcher.key, fetcher.data.prediction)
      })

    console.log(suggestionsMap)
  }, [fetchers, suggestionsMap])

  return (
    <div className="flex">
      <div className="w-full">
        <ClientOnly>
          {() => (
            <div className="mx-auto max-w-prose text-lg">
              <CodeMirror
                ref={mirrorRef}
                value={defaultContents}
                onChange={(value) => {
                  console.log("Saving file")

                  const form = new FormData()
                  form.append("filename", filename)
                  form.append("content", value)
                  form.append("intent", "save_file")

                  submit(form, {
                    method: "POST",
                    navigate: false,
                    debounceTimeout: 500,
                    fetcherKey: "save_file",
                  })
                }}
                extensions={[
                  basicSetup,
                  EditorView.lineWrapping,
                  markdown({
                    completeHTMLTags: false,
                  }),
                  EditorView.theme({
                    "&": {
                      color: "#333",
                      backgroundColor: "white",
                      lineHeight: "1.25",
                      fontSize: "1.125rem",
                    },
                    ".cm-scroller": {
                      fontFamily: "system-ui;",
                    },
                    ".cm-content": {
                      caretColor: "#0e9",
                    },
                    "&.cm-focused": {
                      outline: "none",
                      // add tailwind's .shadow class
                      "--tw-shadow":
                        "0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);",
                      boxShadow: "var(--tw-shadow);",
                    },
                    "&.cm-focused .cm-cursor": {
                      borderLeftColor: "#0e9",
                    },
                    "&.cm-focused .cm-selectionBackground, ::selection": {
                      backgroundColor: "#eee",
                    },
                    ".cm-gutters": {
                      display: "none",
                    },
                    ".cm-line": {
                      lineHeight: 1.75,
                      paddingLeft: "1.5rem",
                      paddingRight: "1.5rem",
                    },
                  }),
                  inlineSuggestion({
                    fetchFn: async (state: EditorState) => {
                      const [prefix, suffix] = getCursor(state)

                      // Look at the previous chars to see if we should show suggestions
                      const isAfterSpace = prefix.endsWith(" ")
                      const isAfterTwoLinebreaks = prefix.endsWith("\n\n")

                      if (!isAfterSpace && !isAfterTwoLinebreaks) {
                        return ""
                      }

                      const key = await hash(`${prefix}${suffix}`)

                      // If we already have a suggestion for this key, return it
                      if (suggestionsMap.current.has(`writer@${key}`)) {
                        const suggestion = suggestionsMap.current.get(
                          `writer@${key}`,
                        )
                        if (suggestion) {
                          return removeOverlap(prefix, suggestion)
                        } else {
                          suggestionsMap.current.delete(`writer@${key}`)
                        }
                      }

                      const contents = [prefix, suffix].join("\n\n")
                      const matchingLinks =
                        contents.match(/https?:\/\/[^\s)]+/g)

                      console.log({ prefix, suffix, matchingLinks })

                      submit(
                        JSON.stringify({
                          prefix,
                          suffix,
                          extraContext: matchingLinks
                            ? cleanContext(
                                matchingLinks
                                  .map((link) => links[link])
                                  .join("\n\n"),
                              )
                            : "",
                          language: "markdown",
                        }),
                        {
                          encType: "application/json",
                          method: "POST",
                          action: "/writer/copilot",
                          navigate: false,
                          fetcherKey: `writer@${key}`,
                          debounceTimeout: 500,
                        },
                      )
                      try {
                        return new Promise((resolve, reject) => {
                          const timeout = setTimeout(() => reject(), 10000)

                          const interval = setInterval(() => {
                            if (suggestionsMap.current.has(`writer@${key}`)) {
                              clearTimeout(timeout)
                              clearInterval(interval)

                              // Now we need to determine if the suggestion is still valid
                              // The user may have typed more since we requested the suggestion
                              const suggestion = suggestionsMap.current.get(
                                `writer@${key}`,
                              )

                              if (!suggestion) {
                                console.log("No suggestion")
                                return resolve("")
                              }

                              if (isRepetitive(suggestion)) {
                                suggestionsMap.current.delete(`writer@${key}`)
                                return resolve("")
                              }

                              const [newPrefix] = getCursor(state)

                              console.log("Got suggestion")

                              const trimmed = removeOverlap(
                                newPrefix,
                                suggestion,
                              )

                              return resolve(trimmed)
                            }
                          }, 500)
                        })
                      } catch (error) {
                        console.error(error)
                        return ""
                      }
                    },
                    delay: 0,
                  }),
                ]}
              />
            </div>
          )}
        </ClientOnly>
      </div>

      <div className="flex w-full max-w-prose flex-col p-2">
        <div className="sticky top-0 max-h-screen space-y-2 overflow-y-scroll">
          {Object.entries(links).map(([link, defaultValue]) => (
            <NoteCard key={link} href={link} defaultValue={defaultValue} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NoteCard({
  href,
  defaultValue,
}: {
  href: string
  defaultValue: string
}) {
  const id = cleanUrl(href)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [history, setHistory] = useState<Array<string>>([defaultValue])
  const [historyCursor, setHistoryCursor] = useState(history.length)
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue)
  if (prevDefaultValue !== defaultValue) {
    setPrevDefaultValue(defaultValue)
    setHistory((history) =>
      // Insert the new value at this point in the history
      // Discarding any future history
      history.slice(0, historyCursor + 1).concat(defaultValue),
    )
    setHistoryCursor(history.length + 1)
  }

  return (
    <div
      className="rounded bg-white p-2"
      aria-expanded={isExpanded}
      id={`note-${id}`}
    >
      <div className="mb-2">
        {" "}
        <a
          href={href}
          rel="noopener"
          target="blank"
          className="text-sky-600 hover:text-sky-500 hover:underline"
        >
          {id}
        </a>{" "}
      </div>
      <div className="mb-2 flex gap-x-2">
        <Button
          variant="outline"
          size="xs"
          aria-controls={`note-${id}`}
          aria-pressed={isExpanded}
          onClick={() => {
            flushSync(() => {
              setIsExpanded((expanded) => !expanded)
            })

            const textarea = textareaRef.current
            if (!textarea) {
              return
            }
            textarea.style.height = "auto" // Reset the height to recalculate
            if (!isExpanded) {
              // Reversed because this bool hasn't updated yet
              textarea.style.height = textarea.scrollHeight + "px" // Set the new height
            }
          }}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>

        <Form method="POST">
          <input type="hidden" name="url" value={href} />

          <Button
            type="submit"
            variant="outline"
            size="xs"
            name="intent"
            value="fetch_website"
          >
            Fetch
          </Button>
        </Form>

        <Form method="POST">
          <input type="hidden" name="url" value={href} />
          <input type="hidden" name="content" value={defaultValue} />

          <Button
            type="submit"
            variant="outline"
            size="xs"
            name="intent"
            value="summarize_note"
          >
            Summarize
          </Button>
        </Form>

        <Button
          type="submit"
          name="intent"
          value="save_note"
          size="xs"
          variant={"outline"}
          form={`save-${id}`}
        >
          Save
        </Button>

        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={history.length === 0}
          onClick={() => {
            setHistoryCursor((cursor) => cursor - 1)
          }}
        >
          Undo
        </Button>

        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={historyCursor === history.length}
          onClick={() => {
            setHistoryCursor((cursor) => cursor + 1)
          }}
        >
          Redo
        </Button>
      </div>

      <Form method="POST" className="flex flex-col gap-1" id={`save-${id}`}>
        <input type="hidden" name="url" value={href} />
        <textarea
          key={historyCursor}
          ref={textareaRef}
          name="content"
          rows={1}
          defaultValue={history[historyCursor - 1]}
          className="resize-none overflow-y-hidden"
        />
      </Form>
    </div>
  )
}

function removeOverlap(prefix: string, suggestion: string) {
  let commonSubstring = ""
  let tempString = ""

  // Normalize whitespaces and trim
  prefix = prefix.replace(/\s+/g, " ").toLowerCase()
  suggestion = suggestion.replace(/\s+/g, " ").toLowerCase()

  // Iterate backwards through the prefix, and forwards through the suggestion
  for (let i = prefix.length - 1; i >= 0; i--) {
    tempString = prefix[i] + tempString
    if (suggestion.startsWith(tempString)) {
      commonSubstring = tempString
    }
  }

  // Remove the common substring from the suggestion
  return suggestion.substring(commonSubstring.length)
}

function cleanContext(context: string) {
  const lines = Array.from(
    new Set<string>(context.split("\n").map((line) => line.trim())),
  )

  console.log({ context: lines })

  return lines.join("\n")
}

function getCursor(state: EditorState) {
  const prefix = state.doc.sliceString(0, state.selection.main.to)
  const suffix = state.doc.sliceString(state.selection.main.to)

  return [
    // Only get this section of the article, marked by headings
    prefix.slice(prefix.lastIndexOf("##")),
    suffix.slice(0, suffix.indexOf("##")).trim(),
  ]
}

function isRepetitive(text: string, threshold: number = 6) {
  const words = new Map<string, number>()

  text.split(" ").forEach((word) => {
    if (!words.has(word)) {
      words.set(word, 0)
    }

    const count = words.get(word) || (words.set(word, 0) && 0)
    words.set(word, count + 1)
  })

  return Math.max(...words.values()) > threshold
}

function hash(str: string) {
  return window.crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(str))
    .then((hash) => {
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    })
}
