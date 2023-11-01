// http://localhost:3000/content/remix-multiple-actions/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useRef } from "react"

declare global {
  var actions: string[]
}

if (!global.actions) {
  global.actions = []
}

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.clone().formData()

  const _action = formData.get("_action")
  if (_action === "LIKE") {
    return likeTweetAction(args)
  }

  if (_action === "RETWEET") {
    return retweetAction(args)
  }

  if (_action === "REPLY") {
    return replyAction(args)
  }

  if (_action === "SHARE") {
    return shareAction(args)
  }

  throw new Error("Unknown action")
}

async function likeTweetAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id")

  global.actions.push("Liked tweet")
  console.log("🧡 likeTweetAction", id)
  return null
}

async function retweetAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id")

  global.actions.push("Retweeted tweet")
  console.log("🔁 retweetAction", id)
  return null
}

async function replyAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id")

  global.actions.push("Replied to tweet")
  console.log("💬 replyAction", id)
  return null
}

async function shareAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id")

  global.actions.push("Shared tweet")
  console.log("📤 shareAction", id)
  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    actions: global.actions,
  })
}

export default function Example() {
  const { actions } = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto max-w-[600px]">
      <h1 className="bold mb-4 text-2xl">Remix Multiple Actions</h1>

      <div>
        <Tweet
          showKeyboardHints
          flashMinimizeButton
          html={
            /* html */ `I've decided to become a minimalist, what are a bunch of minimalist things I can buy?`
          }
          replies={59}
          retweets={66}
          likes={978}
          link="https://twitter.com/jacobmparis/status/1386200884795822084"
        />
      </div>
      <ul>
        {actions.map((action, i) => (
          <li key={i}>{action}</li>
        ))}
      </ul>
    </div>
  )
}

type TweetInput = {
  media:
    | Array<
        | {
            alt_text: string
            height: number
            type: "photo"
            url: string
            width: number
          }
        | {
            height: number
            preview_image_url: string
            type: "animated_gif" | "video"
            variants: { url: string }[]
            width: number
          }
      >
    | undefined
  referenced_tweets: TweetInput[] | undefined
  type: "quoted" | null
  author: { name: string; screen_name: string; profile_image_url: string }
  attachments: {
    media_key: string
    height: number
    width: number
    type: string
    preview_image_url: string
  }[]
  replyingTo: string[]
  html: string
  id: string
  created_at: string
  likes: number
  replies: number
  retweets: number
  date: string
  link: string
  showKeyboardHints?: boolean
  defaultMinimized?: boolean
  autoFocus?: boolean
  flashMinimizeButton?: boolean
}

export function Tweet({
  autoFocus = false,
  flashMinimizeButton = false,
  showKeyboardHints = true,
  defaultMinimized = false,
  html,
  likes = 0,
  replies = 0,
  retweets = 0,
  date,
  media = [],
  link,
}: Partial<TweetInput>) {
  let grid = media
    ? {
        4: `
    "media-0 media-1" 10rem
    "media-2 media-3" 10rem
    / 50% 50%;
    `,
        3: `
    "media-0 media-1" 10rem
    "media-0 media-2" 10rem
    / 1fr 1fr;
    `,
        2: `
    "media-0 media-1" 20rem
    / 50% 50%
    `,
        1: `"media-0" 100% / 100%`,
      }[media?.length]
    : undefined

  const articleRef = useRef<HTMLElement>(null)

  return (
    <article
      ref={articleRef}
      className={`relative cursor-pointer scroll-my-48 border border-gray-100 px-4 focus:z-10 focus:outline-none focus:ring-2 focus:ring-sky-500 [&:not(:focus)_.hint]:hidden ${"pt-4"} hover:bg-gray-50`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "l") {
          const target = e.target as HTMLElement

          const likeButton = target.querySelector<HTMLButtonElement>(
            'button[data-testid="like"]',
          )

          if (likeButton) {
            likeButton.ariaPressed = "true"
            setTimeout(() => {
              likeButton.ariaPressed = "false"
            }, 250)
          }
        }

        if (e.key === "r") {
          const target = e.target as HTMLElement

          const replyButton = target.querySelector<HTMLButtonElement>(
            'button[data-testid="reply"]',
          )

          if (replyButton) {
            replyButton.ariaPressed = "true"
            setTimeout(() => {
              replyButton.ariaPressed = "false"
            }, 250)
          }
        }

        if (e.key === "t") {
          const target = e.target as HTMLElement

          const retweetButton = target.querySelector<HTMLButtonElement>(
            'button[data-testid="retweet"]',
          )

          if (retweetButton) {
            retweetButton.ariaPressed = "true"
            setTimeout(() => {
              retweetButton.ariaPressed = "false"
            }, 250)
          }
        }
      }}
    >
      <div>
        <div className="flex gap-x-4">
          <img
            alt="Jacob Paris"
            src="https://pbs.twimg.com/profile_images/1562032990640816129/dZwvE4v2_normal.jpg"
            decoding="async"
            className="h-fit rounded-full"
          />
          <div className="w-full">
            <div
              className={`flex justify-between ${false ? "opacity-80" : ""}`}
            >
              <div className="flex gap-x-2">
                <div className="text-lg font-bold" title="Jacob Paris">
                  Jacob Paris
                </div>
                <div className="text-lg text-gray-600" title="jacobmparis">
                  @jacobmparis
                </div>
                <span className="font-bold"> · </span>
                {date ? (
                  <a
                    href={link}
                    className="text-lg text-gray-600 hover:underline"
                  >
                    <time
                      title={`Time Posted: ${new Date(date).toUTCString()}`}
                      dateTime={new Date(date).toISOString()}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </time>
                  </a>
                ) : null}
              </div>
            </div>

            <div className={`mb-4`}>
              {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
            </div>

            {media?.length ? (
              <div
                className="mb-4 mt-2 grid gap-1 overflow-hidden rounded-2xl border border-solid border-gray-300 "
                style={{ grid: grid }}
              >
                {media.map((media, i) => {
                  if (media.type === "photo") {
                    return (
                      <div key={i} className="relative">
                        <img
                          className="h-full w-full object-cover"
                          style={{ gridArea: `media-${i}` }}
                          alt={media.alt_text}
                          src={media.url}
                          width={media.width}
                          height={media.height}
                        />
                        <div className="absolute bottom-0 left-0 p-3">
                          {media.alt_text ? (
                            <div
                              className="rounded bg-black px-1 text-sm font-bold text-white"
                              title={media.alt_text}
                            >
                              ALT
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  }

                  if (media.type === "animated_gif") {
                    return (
                      <div key={i} className="relative">
                        <video
                          src={media.variants[0].url}
                          poster={media.preview_image_url}
                          preload="none"
                          autoPlay
                          loop
                        />
                        <div className="absolute bottom-0 left-0 p-3">
                          <div className="rounded bg-black px-1 text-sm font-bold text-white">
                            GIF
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (media.type === "video") {
                    return (
                      <div key={i} className="relative bg-black">
                        <video
                          controls
                          src={media.variants.at(-1)?.url}
                          poster={media.preview_image_url}
                          autoPlay
                          muted
                          className="h-full"
                          preload="none"
                        />
                      </div>
                    )
                  }

                  throw new Error(`Unsupported media type ${media.type}`)
                })}
              </div>
            ) : null}

            <div className="flex justify-between  px-2 py-4 ">
              <Form method="post" className="inline-flex">
                <input type="hidden" name="tweetId" value={link} />

                <button
                  className="group peer relative inline-grid items-center justify-center focus:outline-none"
                  aria-label="Reply to tweet"
                  data-testid="reply"
                  name="_action"
                  value="REPLY"
                  type="submit"
                >
                  <div className="relative inline-grid items-center justify-center text-[#536471] transition-colors duration-200 group-hover:text-[#1d9bf0] group-focus:text-[#1d9bf0] group-aria-pressed:text-[#1d9bf0]">
                    <div className="absolute inset-0 -m-2 rounded-full bg-[#1d9bf01a] opacity-0  transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 group-focus:ring-2 group-focus:ring-[#1d9bf0] group-aria-pressed:opacity-100 "></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.75"
                      stroke="none"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
                      />
                    </svg>
                  </div>
                  {showKeyboardHints ? (
                    <div className="hint absolute left-0 flex -translate-x-full px-1">
                      <kbd className="shadow-crisp inline-flex items-center rounded border border-gray-100 bg-white px-2 text-sm font-medium text-gray-500">
                        R
                      </kbd>
                    </div>
                  ) : null}
                </button>

                {replies ? (
                  <span className="px-3 text-[#536471] transition-colors duration-200 peer-hover:text-[#1d9bf0] peer-focus:text-[#1d9bf0] peer-aria-pressed:text-[#1d9bf0]">
                    {replies}
                  </span>
                ) : null}
              </Form>

              <Form method="post" className="inline-flex">
                <input type="hidden" name="tweetId" value={link} />

                <button
                  className="group peer relative inline-grid items-center justify-center focus:outline-none"
                  aria-label="Retweet"
                  data-testid="retweet"
                  name="_action"
                  value="RETWEET"
                  type="submit"
                >
                  <div className="relative inline-grid items-center justify-center text-[#536471]  transition-colors duration-200 group-hover:text-[#00ba7c] group-focus:text-[#00ba7c] group-aria-pressed:text-[#00ba7c]">
                    <div className="absolute inset-0 -m-2 rounded-full bg-[#00ba7c1a] opacity-0  transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 group-focus:ring-2 group-focus:ring-[#00ba7c] group-aria-pressed:opacity-100 "></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.75"
                      stroke="none"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
                      ></path>
                    </svg>
                  </div>
                  {showKeyboardHints ? (
                    <div className="hint absolute left-0 flex -translate-x-full px-1">
                      <kbd className="shadow-crisp inline-flex items-center rounded border border-gray-100 bg-white px-2 text-sm font-medium text-gray-500">
                        T
                      </kbd>
                    </div>
                  ) : null}
                </button>

                {retweets ? (
                  <span className="px-3 text-[#536471] transition-colors duration-200 peer-hover:text-[#00ba7c] peer-focus:text-[#00ba7c] peer-aria-pressed:text-[#00ba7c]">
                    {retweets}
                  </span>
                ) : null}
              </Form>

              <Form method="post" className="inline-flex">
                <input type="hidden" name="tweetId" value={link} />

                <button
                  className="group peer relative inline-grid items-center justify-center focus:outline-none"
                  aria-label="Like tweet"
                  data-testid="like"
                  name="_action"
                  value="LIKE"
                  type="submit"
                >
                  <div className="relative inline-grid items-center justify-center text-[#536471] transition-colors duration-200 group-hover:text-[#f91880] group-focus:text-[#f91880]  group-aria-pressed:text-[#f91880]">
                    <div className="absolute inset-0 -m-2 rounded-full bg-[#f918801a] opacity-0 transition-opacity  duration-200 group-hover:opacity-100 group-focus:opacity-100 group-focus:ring-2 group-focus:ring-[#f91880] group-active:bg-[#f91880] group-aria-pressed:opacity-100 group-aria-pressed:ring-[#f91880]"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.75"
                      stroke="none"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                      />
                    </svg>
                  </div>
                  {showKeyboardHints ? (
                    <div className="hint absolute left-0 flex -translate-x-full px-1">
                      <kbd className="shadow-crisp inline-flex items-center rounded border border-gray-100 bg-white px-2 text-sm font-medium text-gray-500">
                        L
                      </kbd>
                    </div>
                  ) : null}
                </button>

                {likes ? (
                  <span className="px-3 text-[#536471] transition-colors duration-200 peer-hover:text-[#f91880] peer-focus:text-[#f91880]  peer-aria-pressed:text-[#f91880]">
                    {likes}
                  </span>
                ) : null}
              </Form>

              <Form method="post" className="inline-grid">
                <input type="hidden" name="tweetId" value={link} />

                <button
                  className="group relative inline-grid items-center justify-center focus:outline-none"
                  aria-label="Share tweet"
                  data-testid="share"
                  name="_action"
                  value="SHARE"
                  type="submit"
                >
                  <div className="relative inline-grid items-center justify-center text-[#536471] transition-colors duration-200 group-hover:text-[#1d9bf0] group-focus:text-[#1d9bf0] group-aria-pressed:text-[#1d9bf0]">
                    <div className="absolute inset-0 -m-2 rounded-full bg-[#1d9bf01a] opacity-0  transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 group-focus:ring-2 group-focus:ring-[#1d9bf0] group-aria-pressed:opacity-100 "></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.75"
                      stroke="none"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
                      />
                    </svg>
                  </div>

                  {showKeyboardHints ? (
                    <div className="hint absolute left-0 flex -translate-x-full px-1">
                      <kbd className="shadow-crisp inline-flex items-center rounded border border-gray-100 bg-white px-2 text-sm font-medium text-gray-500">
                        S
                      </kbd>
                    </div>
                  ) : null}
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
