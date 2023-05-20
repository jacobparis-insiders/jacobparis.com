import type { LoaderArgs } from "@remix-run/node"
import svg2img from "svg2img"
import satori from "satori"
import invariant from "tiny-invariant"
export async function loader({ request }: LoaderArgs) {
  const font = "Inter"
  const text =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`'’\""

  //fetch google font in bold, normal, and medium
  const weights = [400, 500, 600, 700]

  invariant(weights)

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

  // convert iterator to array of matches

  const fonts = await Promise.all(
    [...resource]
      .map((match) => match[1])
      .map((url) => fetch(url).then((response) => response.arrayBuffer()))
      .map(async (buffer, i) => ({
        name: "Inter",
        style: "normal",
        weight: weights[i],
        data: await buffer,
      })),
  )

  const params = new URL(request.url).searchParams
  const titleInput = params.get("title")
  invariant(titleInput, "title is required")
  const title = decodeURIComponent(titleInput)

  const titleSize = title.length < 40 ? "text-6xl" : "text-5xl"
  const descriptionInput = params.get("description")
  const description = decodeURIComponent(descriptionInput || "")
  const descriptionSize = description.length < 80 ? "text-2xl" : "text-xl"
  const dateInput = params.get("date")
  invariant(dateInput, "date is required")
  const date = new Date(decodeURIComponent(dateInput)).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  const slugInput = params.get("slug")
  invariant(slugInput, "slug is required")
  const slug = decodeURIComponent(slugInput)

  // sanitize the params
  const svg = await satori(
    <div tw="h-full w-full flex flex-col bg-white pt-16 pl-24 relative text-2xl">
      <div tw="bg-gray-100 rounded-l-3xl flex flex-col gap-0">
        <div tw="flex px-8 pb-0 mb-0">
          <div tw="h-6 w-6 mt-6 mr-2 rounded-full border border-red-600 border-opacity-30 bg-red-500"></div>
          <div tw="h-6 w-6 mt-6 mx-2 rounded-full border border-yellow-600 border-opacity-30 bg-yellow-500"></div>
          <div tw="h-6 w-6 mt-6 mx-2 rounded-full border border-green-600 border-opacity-30 bg-green-500"></div>
          <div tw="bg-gray-200 text-gray-500 mt-4 mx-8 px-16 py-2 rounded-full flex">
            {" "}
            jacobparis.com <span tw="px-4 text-gray-400">/</span> guides{" "}
            <span tw="px-4 text-gray-400">/</span>{" "}
            <span tw="text-sky-600">{slug} </span>
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
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 600,
      // @ts-ignore
      fonts: fonts,
    },
  )

  const { data, error } = await new Promise((resolve) => {
    svg2img(svg, (error, buffer) => {
      if (error) {
        console.error(error)
        resolve({ data: null, error })
      } else {
        resolve({ data: buffer, error: null })
      }
    })
  })

  if (error) {
    return new Response(error, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}
