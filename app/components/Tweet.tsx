import * as React from "react"

export function Tweet({
  text,
  imageUrl = "",
  tweetUrl = "",
  className = "",
  ...props
}) {
  const paragraphs = Array.isArray(text) ? text : [text]
  return (
    <div
      {...props}
      className={`relative my-4 rounded-xl border bg-white p-4 hover:bg-gray-50 hover:shadow-sm ${className} not-prose`}
    >
      {tweetUrl ? (
        <a href={tweetUrl} className="absolute inset-0">
          <span className="sr-only">View tweet</span>
        </a>
      ) : null}

      <div className="mb-4 py-2">
        {/* Image on the left, text on the right  */}

        <div className="flex items-center">
          <img
            src="/images/jacob.png"
            alt="Tweet"
            className="w-12 rounded-full"
          />
          <div className="px-2">
            <div>
              <span className="font-semibold">Jacob Paris 🇨🇦</span>
            </div>
            <div>
              <span className="text-gray-700">@jacobmparis</span>
            </div>
          </div>
        </div>
      </div>

      {paragraphs.map((paragraph) => (
        <p className="mb-4 text-black">{paragraph}</p>
      ))}

      {imageUrl ? <img className="rounded-lg border" src={imageUrl} /> : null}
    </div>
  )
}
