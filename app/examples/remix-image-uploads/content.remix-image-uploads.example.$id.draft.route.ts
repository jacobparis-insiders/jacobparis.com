// http://localhost:3000/content/remix-image-uploads/example

import type { ActionFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"

import { useParams } from "@remix-run/react"
import { useCallback, useRef } from "react"
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher"
import db from "./db.server.ts"

/**
 * @tutorial https://www.jacobparis.com/content/remix-form-autosave
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-image-uploads/example")
  }

  const draft = db[id].draft

  const draftId = formData.get("draftId")
  if (draft.id !== draftId?.toString()) {
    // Draft is outdated, so we don't want to save it
    return json({ success: false })
  }

  const body = formData.get("body")
  draft.body = body ? body.toString() : ""

  // accept multiple already uploaded file URLs from formData and save it to the db
  const fileUrls = formData.getAll("fileUrl")
  const fileNames = formData.getAll("fileName")

  draft.files = []
  fileUrls.forEach((file, index) => {
    const url = file.toString()
    if (!url) return
    if (!url.startsWith("https://")) return

    const name = fileNames[index] ? fileNames[index].toString() : ""
    draft.files.push({
      url,
      name,
      signedUrl: null,
    })
  })

  return json({ success: true })
}

type DraftSubmitOptions = {
  fileUrls?: string[]
  files?: {
    name: string
    url: string
  }[]
  removeFileUrls?: string[]
  debounceTimeout?: number
}

/**
 * @tutorial https://www.jacobparis.com/content/remix-rpc-pattern
 * @example
 *
 * const formRef = useRef<HTMLFormElement>(null)
 * const submit = useDraftSubmit(formRef)
 *
 * @example
 * <textarea
 *   onChange={() => {
 *     submitDraft({ debounceTimeout: 1000 })
 *   }}
 *   onBlur={() => {
 *     submitDraft()
 *   }}
 * />
 *
 * @example
 * const urls = await uploadImages(files)
 * submitDraft({ fileUrls: urls })
 *
 */
export function useDraftSubmit(formRef: React.RefObject<HTMLFormElement>) {
  const params = useParams()
  const fetcher = useDebounceFetcher()
  const deletedFiles = useRef<string[]>([])

  const action = `/content/remix-image-uploads/example/${params.id}/draft`

  const submit = useCallback(
    (options: DraftSubmitOptions = {}) => {
      const body = new FormData(formRef.current || undefined)

      // We handle file inputs separately so we don't upload them to our server using JS
      body.delete("file")

      if (options.removeFileUrls) {
        // This is an ongoing list of files that have been removed
        // If a user removes a second file before the first one has finished removing
        // We don't want to re-add the first file by mistake
        deletedFiles.current = [
          ...deletedFiles.current,
          ...options.removeFileUrls,
        ]

        // We require an explicit undo to remove a file
        const existingFileUrls = Array.from(body.getAll("fileUrl"))
        const existingFileNames = Array.from(body.getAll("fileName"))

        const existingFiles = existingFileUrls
          .map((url, index) => ({
            url: url.toString(),
            name: existingFileNames[index]?.toString(),
          }))
          .filter((file) => !deletedFiles.current.includes(file.url.toString()))

        body.delete("fileUrl")
        body.delete("fileName")
        for (const { name, url } of existingFiles) {
          body.append("fileUrl", url)
          body.append("fileName", name)
        }
      }

      if (options.files) {
        for (const { name, url } of options.files) {
          if (deletedFiles.current.includes(url)) continue

          body.append("fileUrl", url)
          body.append("fileName", name)
        }
      }

      fetcher.submit(body, {
        method: "POST",
        action,
        debounceTimeout: options.debounceTimeout,
      })
    },
    [fetcher, formRef, action],
  )

  return submit
}
