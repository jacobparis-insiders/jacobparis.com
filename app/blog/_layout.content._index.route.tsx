import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { ButtonLink } from "~/components/ButtonLink.tsx"
import { SocialBannerSmall } from "~/components/SocialBannerSmall.tsx"
import { getServerTiming } from "#app/utils/timing.server.ts"
import { getContentListData, getBlogList } from "./get-content-list.ts"
import { getButtondownEmails } from "../moulton/buttondown.server.ts"

export { mergeHeaders as headers } from "~/utils/misc.ts"

export const meta: MetaFunction = ({ params }) => {
  return [
    {
      title: "Articles, Guides, and Cheatsheets | Jacob Paris",
    },
  ]
}

export const handle = {
  id: "blog-post",
  getSitemapEntries: async () => {
    const whenContent = getContentListData()
    const whenMoulton = getButtondownEmails()

    const sitemap = [
      {
        route: `content`,
        priority: 0.7,
      },
    ]

    for (const page of await whenContent) {
      if (!page?.frontmatter.published) continue
      sitemap.push({
        route: `content/${page?.frontmatter.slug}`,
        priority: 0.7,
      })
    }

    const moulton = await whenMoulton

    if (moulton.code === "success") {
      for (const page of moulton.data.results) {
        sitemap.push({
          route: `content/moulton-${page.id}`,
          priority: 0.7,
        })
      }
    }

    return sitemap
  },
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { time, getServerTimingHeader } = getServerTiming()
  // const url = new URL(request.url)
  // const tag = url.searchParams.get("tag")

  const blogContent = await time("contentList", () => getContentListData())

  const blogList = getBlogList(blogContent)

  // const tags = new Set<string>()
  // for (const blog of blogList) {
  //   if (!blog.tags) continue

  //   for (const tag of blog.tags.split(",").map((t) => t.trim())) {
  //     tags.add(tag)
  //   }
  // }

  let moultonIssues
  const moultonResponse = await time("moultonIssues", () =>
    getButtondownEmails(),
  )
  if (moultonResponse.code === "success") {
    moultonIssues = moultonResponse.data.results
  }

  const content: Array<{
    type: "jacobparis.com" | "moulton"
    slug: string
    timestamp: string | null
    title: string
  }> = []

  content.push(
    ...blogList
      // .filter((blog) => {
      //   if (tag && !blog.tags) return false
      //   if (tag && !blog.tags?.includes(tag)) return false

      //   return true
      // })
      .map((blog) => {
        return {
          type: "jacobparis.com" as const,
          slug: blog.slug,
          timestamp: blog.timestamp,
          title: blog.title,
        }
      }),
  )

  if (moultonIssues) {
    content.push(
      ...moultonIssues
        .filter((issue) => issue.publish_date)
        .map((issue) => ({
          type: "moulton" as const,
          slug: `moulton-${issue.id}`,
          title: issue.subject,
          timestamp: new Date(issue.publish_date!).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        })),
    )
  }

  content.sort((a, b) => {
    if (!a.timestamp) return 1
    if (!b.timestamp) return -1

    const aDate = new Date(a.timestamp)
    const bDate = new Date(b.timestamp)

    if (aDate > bDate) return -1
    if (aDate < bDate) return 1

    return 0
  })

  return json(
    {
      content,
      // tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
      // currentTag: tag,
    },
    {
      headers: {
        ...getServerTimingHeader(),
      },
    },
  )
}

export default function Blog() {
  const { content } = useLoaderData<typeof loader>()

  return (
    <div>
      <div className="relative z-40 flex justify-center bg-[#f5f5f5] py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light shadow-smooth sticky top-0 z-30 mb-8 border-b border-neutral-200 py-1" />

      <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-8">
        <h1 className="mb-12 text-2xl">Articles, guides, and cheatsheets</h1>

        {/* <ul className="mb-12 columns-2 gap-x-2 text-sm text-gray-700 sm:columns-4">
          <li key={"all"} className="mb-3 pr-4">
            <Link
              to={`/content`}
              className={currentTag ? "hover:text-sky-600" : "font-bold"}
            >
              All posts
            </Link>
          </li>
          {tags.map((tag) => (
            <li key={tag} className="mb-3 pr-4">
              <Link
                to={`/content?tag=${tag}`}
                className={
                  currentTag === tag ? "font-bold" : `hover:text-sky-600`
                }
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul> */}

        <ol className="grid gap-x-8 gap-y-2">
          {content.map((item) => {
            if (item.type === "jacobparis.com") {
              return (
                <BlogItem
                  key={item.slug}
                  slug={item.slug}
                  title={item.title}
                  timestamp={item.timestamp}
                />
              )
            } else if (item.type === "moulton") {
              return (
                <MoultonItem
                  key={item.slug}
                  slug={item.slug}
                  title={item.title}
                  timestamp={item.timestamp}
                />
              )
            }
          })}
        </ol>
      </div>
    </div>
  )
}

export function BlogItem({
  slug,
  title,
  timestamp,
}: {
  slug: string
  title: string
  timestamp: string | null
}) {
  return (
    <article className="">
      <Link
        prefetch="intent"
        to={`/content/${slug}`}
        className={`hover:shadow-smooth focus:shadow-smooth group -ml-4 flex overflow-hidden rounded-lg transition-all hover:bg-white focus:bg-white`}
      >
        <div className={`flex flex-col gap-2 px-4 py-4`}>
          {timestamp ? (
            <time className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              {timestamp}
            </time>
          ) : null}
          <h2
            className="text-xl font-bold text-neutral-800"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h2>
        </div>
      </Link>
    </article>
  )
}

function MoultonItem({
  slug,
  title,
  timestamp,
}: {
  slug: string
  title: string
  timestamp: string | null
}) {
  return (
    <article className="">
      <Link
        prefetch="intent"
        to={`/content/${slug}`}
        className={`group -ml-4 flex overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-900 hover:shadow-xl`}
      >
        <div className={`flex flex-col gap-2 px-4 py-4`}>
          {timestamp ? (
            <time className="text-xs font-bold uppercase tracking-wide text-gray-400 ">
              {timestamp}
            </time>
          ) : null}
          <h2
            className="text-xl font-bold text-gray-100 group-hover:text-white"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h2>
        </div>
      </Link>
    </article>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-48">
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-black sm:text-5xl">
            404
          </h1>
          <p className="mt-4 text-lg font-medium text-black text-opacity-50">
            That page can't be found
          </p>

          <div className="mt-6">
            <ButtonLink
              className="inline-flex flex-grow-0 items-center px-4 py-2"
              to="/"
            >
              <span className="mx-2 font-medium leading-6">Take me home</span>
            </ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  throw error
}
