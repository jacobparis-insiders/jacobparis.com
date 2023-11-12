// http://localhost:3000/content/remix-image-uploads/example

import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { useFileURLs } from "./useFileUrls.ts"
import { Icon } from "#app/components/icon.tsx"
import { FadeIn } from "../FadeIn.tsx"

export default function Example() {
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
            <FakeUpload />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export function FakeUpload() {
  const getFileUrl = useFileURLs()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    async onDrop(acceptedFiles) {
      setPendingFiles((pendingFiles) => [...pendingFiles, ...acceptedFiles])
    },
    noClick: true,
  })

  return (
    <div>
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
            id="image-input"
            name="file"
            multiple
            type="file"
            className="sr-only"
          />
        </label>
      </div>

      <div className="flex flex-row flex-wrap gap-x-2">
        {pendingFiles.map((file, index) => (
          <FakeUploadImage src={getFileUrl(file)} key={index} />
        ))}
      </div>
    </div>
  )
}

function FakeUploadImage({ src }: { src: string }) {
  const [progress, setProgress] = useState(0)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((progress) => {
        if (progress <= 100) {
          return progress + Math.random() * 50
        }

        return progress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  if (isHidden) return null

  return (
    <div className="group relative mt-2 h-20 w-20 rounded-lg border border-neutral-100">
      {progress <= 99 ? (
        <div
          className="absolute bottom-0 left-0 right-0 top-0 origin-top rounded-t-lg bg-black/50 transition-transform duration-300"
          style={{ transform: `scaleY(${(99 - progress) / 100.0})` }}
        />
      ) : null}

      <img src={src} alt="Uploaded file" className="rounded-lg" />

      <button
        type="button"
        onClick={() => {
          setIsHidden(true)
        }}
        className="absolute -right-[0.625rem] -top-2 hidden rounded-full bg-white text-black/50 hover:block hover:text-black group-hover:block"
      >
        <Icon name="cross-circled" className="block h-6 w-6" />
      </button>
    </div>
  )
}
