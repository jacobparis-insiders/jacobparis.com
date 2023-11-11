// http://localhost:3000/content/remix-image-uploads/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { useRef, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import invariant from "tiny-invariant"
import { randomUuid } from "../crypto.ts"
import { useResetCallback } from "../useResetCallback.tsx"
import { useDraftSubmit } from "./content.remix-image-uploads.example.$id.draft.route.ts"
import {
  generateSignedUrl,
  uploadImages,
} from "./content.remix-image-uploads.example.cloudflare-images.route.ts"
import db from "./db.server.ts"
import { useFileURLs } from "./useFileUrls.ts"
import { ImageWithPlaceholder } from "../ImageWithPlaceholder.tsx"
import { Icon } from "#app/components/icon.tsx"
import { FadeIn, FadeInUp } from "../FadeIn.tsx"

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-image-uploads/example")
  }

  const body = formData.get("body")

  // These are files uploaded via the file input
  // We don't support this because we want clients to upload directly to Cloudflare
  const filesToUpload = formData.getAll("file")
  for (const file of filesToUpload) {
    if (!file) continue

    throw new Error("Direct file uploads are not supported")
  }

  const fileUrls = formData.getAll("fileUrl")
  const fileNames = formData.getAll("fileName")

  const draftId = formData.get("draftId")
  invariant(draftId, "Draft ID is required")

  // check recent message, if draftId matches, we've already sent this message
  const recentMessage = db[id].messages[db[id].messages.length - 1]
  if (recentMessage?.draftId !== draftId) {
    db[id].messages.push({
      draftId: draftId.toString() || "",
      id: randomUuid(),
      body: body ? body.toString() : "",
      files: fileUrls.map((url, index) => ({
        url: url.toString(),
        name: fileNames[index]?.toString() || "",
        signedUrl: null,
      })),
    })
  }

  db[id].draft = {
    id: randomUuid(),
    body: "",
    files: [],
  }

  return json({
    success: true,
    nonce: randomUuid(),
  })
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string

  if (!(id in db)) {
    console.info(`No session ${id}, redirecting`)
    throw redirect("/content/remix-image-uploads/example")
  }

  const doc = db[id]

  const draftFiles = await Promise.all(
    doc.draft.files.map(async (file) => ({
      url: file.url,
      name: file.name,
      signedUrl: await generateSignedUrl(file.url),
      optimisticallyHidden: false,
    })),
  )

  const messages = await Promise.all(
    doc.messages.map(async (message) => ({
      body: message.body,
      files: await Promise.all(
        message.files.map(async (file) => ({
          url: file.url,
          name: file.name,
          signedUrl: await generateSignedUrl(file.url),
        })),
      ),
    })),
  )

  return json({
    draft: {
      id: doc.draft.id,
      body: doc.draft.body,
      files: draftFiles,
    },
    messages: messages,
  })
}

export default function Example() {
  const { draft, messages } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const formRef = useRef<HTMLFormElement>(null)
  const submitDraft = useDraftSubmit(formRef)

  const getFileUrl = useFileURLs()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const displayPendingFiles = pendingFiles.filter(
    (file) => !draft.files.some((draftFile) => draftFile.name === file.name),
  )
  const [errorMessage, setErrorMessage] = useState("")

  useResetCallback(draft.files, () => {
    setErrorMessage("")
  })

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onFileDialogOpen() {
      setErrorMessage("")
    },

    async onDrop(acceptedFiles) {
      try {
        if (inputRef.current) {
          // remove files from the real input
          inputRef.current.value = ""
        }

        const fileAlreadyExists = acceptedFiles.some((file) => {
          const currentFiles = [...draft.files, ...pendingFiles]
          return currentFiles.some((draftFile) => draftFile.name === file.name)
        })

        if (fileAlreadyExists) {
          throw new Error("Duplicate file")
        }

        setErrorMessage("")
        setPendingFiles((pendingFiles) => [...pendingFiles, ...acceptedFiles])

        const files = await uploadImages(acceptedFiles)
        submitDraft({ files })
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message)
        }

        setPendingFiles([])
      }
    },
    noClick: true,
  })

  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <div className="text-center">
        <FadeIn className="delay-0">
          <h1 className="mb-6 text-3xl text-neutral-900">This is your space</h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mx-auto mb-8 max-w-[40ch] text-lg text-neutral-700">
            Drag images into the box below to upload them optimistically.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="mx-auto w-full max-w-lg text-left">
            {messages.map((message, i) => (
              <FadeInUp key={i}>
                <div className="px-4 py-1">
                  <div className="mb-2 text-neutral-700">{message.body}</div>
                  <div className="flex flex-wrap gap-2">
                    {message.files.map((file, i) => (
                      <div key={i} className="relative h-32 w-32">
                        <img
                          src={file.signedUrl || ""}
                          alt=""
                          className="h-full w-full bg-neutral-500 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="mx-auto mb-8 w-full  max-w-lg gap-8   overflow-hidden border border-neutral-100 bg-white text-left sm:rounded-lg sm:shadow-xl">
            <div>
              <div>
                <Form ref={formRef} method="POST">
                  <input type="hidden" name="draftId" value={draft.id} />

                  <div
                    {...getRootProps({
                      className: isDragActive ? "bg-neutral-50" : "",
                    })}
                  >
                    <textarea
                      aria-label="Message"
                      name="body"
                      data-key={draft.id}
                      key={draft.id}
                      autoFocus
                      rows={2}
                      defaultValue={actionData ? "" : draft.body}
                      onKeyDown={(e) => {
                        // Submit on enter unless shift is pressed
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          e.currentTarget.form?.requestSubmit()
                        }
                      }}
                      onChange={() => {
                        submitDraft({
                          debounceTimeout: 1000,
                        })
                      }}
                      onBlur={() => {
                        submitDraft()
                      }}
                      placeholder="Jot something down…"
                      className="block w-[60ch] max-w-full resize-none border-none bg-transparent px-4 py-2 placeholder:text-neutral-400 focus:shadow-none focus:outline-none focus:ring-0"
                    />
                  </div>

                  <div className="flex flex-row flex-wrap gap-4 px-2 py-1">
                    {draft.files.map((image) => {
                      const pendingFile = pendingFiles.find(
                        (file) => file.name === image.name,
                      )

                      return (
                        <FileImage
                          key={image.url}
                          url={image.url}
                          name={image.name}
                          onDelete={() => {
                            submitDraft({
                              removeFileUrls: [image.url],
                            })
                          }}
                        >
                          <ImageWithPlaceholder
                            src={image.signedUrl}
                            className="h-20 w-20 rounded-xl border border-neutral-100"
                            placeholderSrc={
                              pendingFile ? getFileUrl(pendingFile) : undefined
                            }
                            onLoad={() => {
                              setPendingFiles((pendingFiles) => {
                                return pendingFiles.filter(
                                  (p) => p !== pendingFile,
                                )
                              })
                            }}
                          />
                        </FileImage>
                      )
                    })}

                    {displayPendingFiles.map((file) => (
                      <div
                        className="relative overflow-hidden rounded-xl border border-neutral-300"
                        key={file.name}
                      >
                        <img
                          src={getFileUrl(file)}
                          alt="Uploaded file"
                          className="h-20 w-20 opacity-50"
                        />
                      </div>
                    ))}
                  </div>

                  {errorMessage ? (
                    <p className="px-4 py-1 text-sm text-red-600" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="flex gap-x-2 px-2 py-1">
                    <div>
                      <label
                        htmlFor="image-input"
                        className="cursor-pointer rounded p-1 hover:bg-neutral-100"
                      >
                        <Icon name="image" className="h-5 w-5" />
                      </label>

                      <input
                        {...getInputProps()}
                        style={{ display: "block" }}
                        key={draft.id}
                        id="image-input"
                        name="file"
                        multiple
                        type="file"
                        className="sr-only"
                      />
                    </div>

                    <div className="flex-1" />

                    <button
                      type="submit"
                      className="cursor-pointer rounded p-1 hover:bg-neutral-100"
                    >
                      <Icon name="paper-plane" className="h-5 w-5" />
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

function FileImage({
  url,
  name,
  children,
  onDelete = () => {},
}: {
  url: string
  name: string
  children: React.ReactNode
  onDelete?: () => void
}) {
  const [isHidden, setIsHidden] = useState(false)

  if (isHidden) return null

  return (
    <div className="group relative">
      <input type="hidden" name="fileUrl" value={url} />
      <input type="hidden" name="fileName" value={name} />
      {children}

      <button
        type="button"
        onClick={() => {
          setIsHidden(true)
          if (onDelete) {
            onDelete()
          }
        }}
        className="absolute -right-2 -top-2 hidden rounded-full bg-white text-black/50 hover:block hover:text-black group-hover:block"
      >
        <Icon name="cross-circled" className="h-6 w-6" />
      </button>
    </div>
  )
}
