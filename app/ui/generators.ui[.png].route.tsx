import type { LoaderFunctionArgs } from "@remix-run/node"
import type { SatoriOptions } from "satori"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { twMerge } from "tailwind-merge"
import invariant from "tiny-invariant"

declare module "react" {
  interface HTMLAttributes<T> {
    tw?: string
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  const titleInput = url.searchParams.get("title")
  invariant(titleInput, "title is required")
  const title = decodeURIComponent(titleInput)

  const descriptionInput = url.searchParams.get("description")
  const description = decodeURIComponent(descriptionInput || "")
  const dateInput = url.searchParams.get("date")
  const date = new Date(decodeURIComponent(dateInput || "")).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  let imageResponse: ArrayBuffer | null = null

  const imgInput = url.searchParams.get("img") || "null"
  if (imgInput !== "null") {
    const img = new URL(decodeURIComponent(imgInput), url.origin)
    if (!url.searchParams.get("source")) {
      // Prevent recursive loop if some clown tries to pass this generator as an image source.
      img.searchParams.set("source", "og")

      // Fetch the image separately because we can't run two instances of Satori at once
      // Letting Satori fetch the image would hang indefinitely
      imageResponse = await fetch(img.toString()).then((r) => r.arrayBuffer())
    }
  }

  if (imageResponse) {
    return satoriResponse(
      <FeaturedImage
        title={title}
        description={description}
        img={imageResponse}
        date={date}
      />,
    )
  }

  return satoriResponse(
    <DefaultImage title={title} description={description} date={date} />,
  )
}

function TitleSection({ title, date }: { title: string; date: string }) {
  const titleSize = title.length < 40 ? "text-5xl" : "text-4xl"

  return (
    <div tw="flex justify-center items-center w-full mx-auto">
      <div tw="flex flex-col w-full px-16  text-center items-center max-w-2xl mx-auto ">
        {date !== "Invalid Date" ? (
          <span tw="uppercase text-lg font-bold mx-auto -mb-4">{date}</span>
        ) : null}

        <h2 tw={`${titleSize} font-bold mb-0`}>{title}</h2>
      </div>
    </div>
  )
}

function BrowserSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      tw={twMerge([
        "rounded-t-md flex flex-col gap-0 pb-48 mx-auto relative overflow-hidden z-10",
        "bg-white border border-neutral-100 shadow",
        className,
      ])}
    >
      <div tw="flex w-full" style={{ width: "600px" }}>
        <div tw="flex pl-3">
          <div tw="h-3 w-3 mt-3 mr-1 rounded-full border border-red-600 border-opacity-30 bg-red-500"></div>
          <div tw="h-3 w-3 mt-3 mx-1 rounded-full border border-yellow-600 border-opacity-30 bg-yellow-500"></div>
          <div tw="h-3 w-3 mt-3 mx-1 rounded-full border border-green-600 border-opacity-30 bg-green-500"></div>
        </div>
        <div tw="mx-auto bg-neutral-400/10  mt-2 px-16 py-1 rounded border border-neutral-400/20 text-xs">
          jacobparis.com
        </div>
      </div>

      {children}
    </div>
  )
}

function DefaultImage({
  title,
  description,
  date,
}: {
  title: string
  description: string
  date: string
}) {
  const descriptionSize = description.length < 80 ? "text-2xl" : "text-xl"

  return (
    <div tw="h-full flex flex-col bg-[#fafafa] text-neutral-700 pt-16 px-8 relative text-2xl">
      <div style={{ width: "1136px" }}>{/* 1200px - 64px (px-8) */}</div>

      <TitleSection title={title} date={date} />

      <p
        tw={`text-neutral-700 ${descriptionSize} mb-12 mx-auto`}
        style={{ lineHeight: "2rem" }}
      >
        {description}
      </p>
    </div>
  )
}

function FeaturedImage({
  title,
  description,
  img,
  date,
}: {
  title: string
  description: string
  img: ArrayBuffer | Buffer | string
  date: string
}) {
  const descriptionSize = description.length < 80 ? "text-2xl" : "text-xl"

  return (
    <div tw="h-full flex flex-col bg-[#fafafa] text-neutral-700 pt-8 px-8 relative text-2xl">
      <div style={{ width: "1136px" }}>{/* 1200px - 64px (px-8) */}</div>

      <TitleSection title={title} date={date} />

      <p
        tw={`text-neutral-700 ${descriptionSize} mb-20 mx-auto max-w-2xl text-center`}
        style={{ lineHeight: "2rem" }}
      >
        {description}
      </p>

      <BrowserSection className="border border-neutral-100 bg-white shadow">
        <div tw="flex flex-col w-full px-2 py-2 text-center items-center max-w-2xl mx-auto">
          <img
            tw="w-full rounded-xs"
            // Satori is ok with ArrayBuffer | Buffer | string
            src={img as string}
            alt=""
          />
        </div>
      </BrowserSection>
    </div>
  )
}

async function satoriResponse(jsx: JSX.Element) {
  const svg = await satori(jsx, {
    width: 1200,
    height: 600,
    fonts: await Promise.all([
      getFont("Inter"),
      getFont("Playfair Display"),
    ]).then((fonts) => fonts.flat()),
  })

  try {
    const resvg = new Resvg(svg)
    const pngData = resvg.render()
    const data = pngData.asPng()

    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
      },
    })
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return new Response(error.message, {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
  }
}

async function getFont(
  font: string,
  weights = [400, 500, 600, 700],
  text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`'’\"–—",
) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${font}:wght@${weights.join(
      ";",
    )}&text=${encodeURIComponent(text)}`,
    {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    },
  ).then((response) => response.text())

  const resource = css.matchAll(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/g,
  )

  return Promise.all(
    [...resource]
      .map((match) => match[1])
      .map((url) => fetch(url).then((response) => response.arrayBuffer()))
      .map(async (buffer, i) => ({
        name: font,
        style: "normal",
        weight: weights[i],
        data: await buffer,
      })),
  ) as Promise<SatoriOptions["fonts"]>
}
