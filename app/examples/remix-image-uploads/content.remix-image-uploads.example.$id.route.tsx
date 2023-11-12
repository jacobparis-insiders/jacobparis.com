// http://localhost:3000/content/remix-image-uploads/example

import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useRef, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
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
import { FadeIn } from "../FadeIn.tsx"
import { flushSync } from "react-dom"

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
    })),
  )

  return json({
    draft: {
      id: doc.draft.id,
      body: doc.draft.body,
      files: draftFiles,
    },
  })
}

export default function Example() {
  const { draft } = useLoaderData<typeof loader>()

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

    // It might seem intuitive to clear the pending files when we do this
    // but we don't actually want to clear the pending file until the real one has loaded on screen
    // Otherwise it'll go blank for a second and that's not a great experience
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
          <h1 className="mb-6 text-3xl text-neutral-900">Upload images</h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mx-auto mb-8 max-w-[40ch] text-lg text-neutral-700 [text-wrap:pretty]">
            Drag images into the box below to upload them optimistically.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="mx-auto mb-8 w-full max-w-lg gap-8 overflow-hidden border border-neutral-100 bg-white p-2 text-left sm:rounded-lg sm:shadow-xl">
            <div>
              <div>
                <Form ref={formRef} method="POST">
                  <input type="hidden" name="draftId" value={draft.id} />

                  <div
                    {...getRootProps({
                      className: isDragActive ? "bg-neutral-50" : "",
                    })}
                  >
                    <label htmlFor="image-input" className="block">
                      <div className="grid cursor-pointer place-items-center rounded-md border-2 border-dashed px-4 py-12 text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-800">
                        <Icon name="image" className="h-8 w-8" />
                        <span> Drop images here </span>
                      </div>

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
                    </label>
                  </div>

                  <div className="flex flex-row flex-wrap gap-2">
                    {draft.files.map((image) => {
                      const pendingFile = pendingFiles.find(
                        (file) => file.name === image.name,
                      )

                      return (
                        <FileImage
                          key={image.name}
                          url={image.url}
                          name={image.name}
                          onDelete={() => {
                            // We remove it from the pending files in the onLoad below
                            // But if they delete it before it loads we need to remove it here
                            // Otherwise they'll see the pending image for a second
                            setPendingFiles((pendingFiles) => {
                              return pendingFiles.filter(
                                (p) => p !== pendingFile,
                              )
                            })

                            submitDraft({
                              removeFileUrls: [image.url],
                            })
                          }}
                        >
                          <ImageWithPlaceholder
                            key={image.name}
                            src={image.signedUrl}
                            className="mt-2 h-20 w-20 rounded-lg border-2 border-white ring-neutral-400 ring-offset-1 group-hover:ring-2"
                            placeholderSrc={
                              pendingFile ? getFileUrl(pendingFile) : undefined
                            }
                            onLoad={() => {
                              console.log("loaded", pendingFile)
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
                        className="relative mt-2 h-20 w-20 overflow-hidden rounded-lg border border-neutral-100"
                        key={file.name}
                      >
                        <img
                          src={getFileUrl(file)}
                          alt="Uploaded file"
                          className="opacity-50"
                        />
                      </div>
                    ))}
                  </div>

                  {errorMessage ? (
                    <p className="px-4 py-1 text-sm text-red-600" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}
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
  className?: string
  onDelete?: () => void
}) {
  const [isHidden, setIsHidden] = useState(false)

  if (isHidden) return null

  return (
    <div className="group relative">
      <input type="hidden" name="fileUrl" value={url} />
      <input type="hidden" name="fileName" value={name} />
      {children}
      {/* // if you delete an image it falls back to the placeholder image */}
      <button
        type="button"
        onClick={() => {
          flushSync(() => {
            setIsHidden(true)
          })

          if (onDelete) {
            onDelete()
          }
        }}
        className="absolute -right-[0.625rem] -top-[0.125rem] hidden rounded-full bg-white text-black/50 hover:block hover:text-black group-hover:block"
      >
        <Icon name="cross-circled" className="block h-6 w-6" />
      </button>
    </div>
  )
}
