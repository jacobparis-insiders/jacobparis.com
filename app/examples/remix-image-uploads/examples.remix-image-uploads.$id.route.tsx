// http://localhost:3000/examples/remix-image-uploads

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import db from "./db.server"
import { useEffect, useRef, useState } from "react"
import { Transition } from "@headlessui/react"
import { useDropzone } from "react-dropzone"
import crypto from "crypto"
import { PaperAirplaneIcon, XCircleIcon } from "@heroicons/react/20/solid"
import { PhotoIcon } from "@heroicons/react/24/outline"
import { useHydrated } from "remix-utils"
import {
  generateSignedUrl,
  uploadImages,
} from "./examples.remix-image-uploads.cloudflare-images.route"
import { useDraftSubmit } from "./examples.remix-image-uploads.$id.draft.route"
import { useResetCallback } from "./useResetCallback"
import { useFileURLs } from "./useFileUrls"
import invariant from "tiny-invariant"

export async function action({ params, request }: ActionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/examples/remix-image-uploads")
  }

  const body = formData.get("body")

  // accept multiple already uploaded file URLs from formData and save it to the db
  const filesToUpload = formData.getAll("file")
  for (const file of filesToUpload) {
    if (!file) continue

    throw new Error("TODO: implement natural file uploads")
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
      id: crypto.randomUUID(),
      body: body ? body.toString() : "",
      files: fileUrls.map((url, index) => ({
        url: url.toString(),
        name: fileNames[index]?.toString() || "",
        signedUrl: null,
      })),
    })
  }

  db[id].draft = {
    id: crypto.randomUUID(),
    body: "",
    files: [],
  }

  return json({
    success: true,
    nonce: crypto.randomUUID(),
  })
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string

  if (!(id in db)) {
    console.info(`No session ${id}, redirecting`)
    throw redirect("/examples/remix-image-uploads")
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

function ImageWithPlaceholder({
  src,
  placeholderSrc,
  onLoad,
  ...props
}: {
  src: string
  placeholderSrc?: string
  onLoad?: () => void
}) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      setImgSrc(src)
      if (onLoad) {
        onLoad()
      }
    }
  }, [src, onLoad])

  return <img src={imgSrc} alt="" {...props} />
}

function FileImage({
  url,
  name,
  signedUrl,
  pendingUrl,
  onLoad = () => {},
  onDelete = () => {},
  ...props
}) {
  const [isHidden, setIsHidden] = useState(false)

  if (isHidden) return null

  return (
    <div className="group relative">
      <input type="hidden" name="fileUrl" value={url} />
      <input type="hidden" name="fileName" value={name} />
      <ImageWithPlaceholder
        src={signedUrl}
        placeholderSrc={pendingUrl}
        onLoad={onLoad}
        {...props}
      />
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
        <XCircleIcon className="h-6 w-6" />
      </button>
    </div>
  )
}
export default function Example() {
  const isHydrated = useHydrated()

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onFileDialogOpen() {
      setErrorMessage("")
    },

    async onDrop(acceptedFiles) {
      try {
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
          <h1 className="mb-6 text-3xl text-gray-800">This is your space</h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-8 max-w-[40ch] text-lg text-gray-500">
            Drag images into the box below to upload them optimistically.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="mx-auto w-full max-w-lg text-left">
            {messages.map((message, i) => (
              <FadeInUp key={i}>
                <div className="px-4 py-1">
                  <div className="mb-2 text-gray-500">{message.body}</div>
                  <div className="flex flex-wrap gap-2">
                    {message.files.map((file, i) => (
                      <div key={i} className="relative h-32 w-32">
                        <img
                          src={file.signedUrl || ""}
                          alt=""
                          className="h-full w-full bg-gray-500 object-cover"
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
          <div className="bg-light mx-auto mb-8  w-full max-w-lg   gap-8 overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
            <div>
              <div>
                <Form ref={formRef} method="POST">
                  <input type="hidden" name="draftId" value={draft.id} />

                  <div
                    {...getRootProps({
                      className: isDragActive ? "bg-gray-50" : "",
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
                      className="block w-[60ch] max-w-full resize-none border-none bg-transparent px-4 py-2 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
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
                          signedUrl={image.signedUrl}
                          className="h-20 w-20 rounded-xl border border-gray-300"
                          pendingUrl={
                            pendingFile ? getFileUrl(pendingFile) : undefined
                          }
                          onLoad={() => {
                            setPendingFiles((pendingFiles) => {
                              return pendingFiles.filter(
                                (file) => file.name !== image.name,
                              )
                            })
                          }}
                          onDelete={() => {
                            submitDraft({
                              removeFileUrls: [image.url],
                            })
                          }}
                        />
                      )
                    })}

                    {displayPendingFiles.map((file) => (
                      <div
                        className="relative overflow-hidden rounded-xl border border-gray-300"
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
                    <label
                      htmlFor="image-input"
                      onClick={open}
                      className="cursor-pointer rounded p-1 hover:bg-gray-100"
                    >
                      <PhotoIcon className="h-5 w-5" />
                    </label>

                    <div className="flex-1" />

                    <button
                      type="submit"
                      className="cursor-pointer rounded p-1 hover:bg-gray-100"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <input
                    {...getInputProps()}
                    style={{ display: "block" }}
                    key={draft.id}
                    id="image-input"
                    name="file"
                    multiple
                    type="file"
                    // If JS is disabled, appear after 1 second, otherwise sr-only will be set and it will never appear
                    className={isHydrated ? "sr-only" : "animate-appear"}
                  />
                </Form>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export function FadeIn({
  className = "",
  show = true,
  children,
}: {
  className?: string
  show?: boolean
  children: React.ReactNode
}) {
  // className="duration-0 transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={show}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}

export function FadeInUp({
  className = "",
  show = true,
  children,
}: {
  className?: string
  show?: boolean
  children: React.ReactNode
}) {
  // className="duration-0 transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={show}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}
