import type { LoaderArgs } from "@remix-run/node"
import type { SatoriOptions } from "satori"
import satori from "satori"
import svg2img from "svg2img"
import invariant from "tiny-invariant"
declare module "react" {
  interface HTMLAttributes<T> {
    tw?: string
  }
}

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams
  const titleInput = params.get("title")
  invariant(titleInput, "title is required")
  const title = decodeURIComponent(titleInput)

  const titleSize = title.length < 40 ? "text-6xl" : "text-5xl"
  const descriptionInput = params.get("description")
  const description = decodeURIComponent(descriptionInput || "")
  const descriptionSize = description.length < 80 ? "text-2xl" : "text-xl"
  const dateInput = params.get("date")
  const date = new Date(decodeURIComponent(dateInput || "")).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  const imgInput = params.get("img") || "null"
  const img = imgInput !== "null" ? decodeURIComponent(imgInput) : null

  // sanitize the params
  const svg = await satori(
    img ? (
      <div
        tw="h-full w-full flex flex-col justify-end bg-gray-700 relative"
        style={{
          backgroundImage: img ? `url(https://www.jacobparis.com/${img})` : "",
          backgroundSize: "1200px 600px",
        }}
      />
    ) : (
      <div tw="h-full w-full flex flex-col bg-white pt-16 pl-24 relative text-2xl">
        <div tw="bg-gray-100 rounded-l-3xl flex flex-col gap-0">
          <div tw="flex px-8 pb-0 mb-0">
            <div tw="h-6 w-6 mt-6 mr-2 rounded-full border border-red-600 border-opacity-30 bg-red-500"></div>
            <div tw="h-6 w-6 mt-6 mx-2 rounded-full border border-yellow-600 border-opacity-30 bg-yellow-500"></div>
            <div tw="h-6 w-6 mt-6 mx-2 rounded-full border border-green-600 border-opacity-30 bg-green-500"></div>
            <div tw="bg-gray-200 text-gray-500 mt-4 mx-8 px-16 py-2 rounded-full flex w-full">
              jacobparis.com
            </div>
          </div>

          <div tw="flex flex-col w-full px-8 justify-between px-16 py-8">
            {date !== "Invalid Date" ? (
              <span tw="w-full uppercase text-lg font-bold text-gray-500">
                {date}
              </span>
            ) : null}
            <h2
              tw={`flex flex-col text-left ${titleSize} font-bold text-gray-800 mb-0`}
            >
              {title}
            </h2>

            <p
              tw={`text-gray-600 ${descriptionSize} mb-8`}
              style={{ lineHeight: "2rem" }}
            >
              {description}
            </p>

            <div tw="flex justify-between items-end w-full">
              <div tw="flex">
                <img
                  tw="w-24 rounded-full"
                  src="https://jacobparis.com/images/jacob.png"
                  alt=""
                />
                <div tw="flex flex-col px-8 py-2">
                  <span tw="font-bold mb-2"> Jacob Paris </span>
                  <span tw="text-gray-500"> @jacobmparis </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div tw="absolute right-0 top-0 hidden px-4 py-4">
          <img
            tw="w-24 rounded-full"
            src="https://jacobparis.com/images/jacob.png"
            alt=""
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
      fonts: await Promise.all([
        getFont("Inter"),
        getFont("Playfair Display"),
      ]).then((fonts) => fonts.flat()),
    },
  )

  const { data, error } = await new Promise(
    (
      resolve: (value: { data: Buffer | null; error: Error | null }) => void,
    ) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({ data: null, error })
        } else {
          resolve({ data: buffer, error: null })
        }
      })
    },
  )

  if (error) {
    return new Response(error.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  })
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
