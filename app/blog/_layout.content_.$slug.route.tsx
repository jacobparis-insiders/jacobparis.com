import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getMDXComponent } from "mdx-bundler/client"
import invariant from "tiny-invariant"

import blogStyles from "~/styles/blog.css"

import { Excerpt } from "~/components/Excerpt.tsx"
import { Highlight } from "~/components/Highlight.tsx"
import { SideNote } from "~/components/SideNote.tsx"
import { Tweet } from "~/components/Tweet.tsx"

import { ButtonLink } from "~/components/ButtonLink.tsx"
import { SocialBannerSmall } from "~/components/SocialBannerSmall.tsx"
import { SubmenuExample } from "~/examples/react-headless-submenus/content.react-headless-submenus.example.route.tsx"
import { FilterExample } from "~/examples/remix-filter-bar/content.remix-filter-bar.example.__filter._index.route.tsx"
import { PaginationExample } from "~/examples/remix-pagination/content.remix-pagination.example.__filter._index.route.tsx"
import {
  DateExamples,
  FileExamples,
  LocalStorageExamples,
} from "~/examples/remix-progressive-client-only/examples.tsx"
import { getServerTiming } from "~/utils/timing.server.ts"

import { cache, cachified } from "#app/cache/cache.server.ts"
import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import { getContentList } from "./content.server.ts"

export { mergeHeaders as headers } from "~/utils/misc.ts"
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: blogStyles }]
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "Not found" }]

  const titleElements = data.frontmatter.title
    ? [
        { title: data.frontmatter.title },
        { name: "twitter:title", content: data.frontmatter.title },
        { property: "og:title", content: data.frontmatter.title },
      ]
    : []

  const descriptionElements = data.frontmatter.description
    ? [
        { name: "description", content: data.frontmatter.description },
        { name: "twitter:description", content: data.frontmatter.description },
        { property: "og:description", content: data.frontmatter.description },
      ]
    : []

  const imageElements = [
    {
      name: "twitter:image",
      content: `https://www.jacobparis.com/content/${data.frontmatter.slug}.png`,
    },
    {
      property: "og:image",
      content: `https://www.jacobparis.com/content/${data.frontmatter.slug}.png`,
    },
    { name: "twitter:card", content: "summary_large_image" },
  ]
  return [
    ...titleElements,
    ...descriptionElements,
    ...imageElements,
    { name: "twitter:site", content: "@jacobmparis" },
    { name: "twitter:creator", content: "@jacobmparis" },
    {
      property: "og:url",
      content: `https://www.jacobparis.com/content/${data.frontmatter.slug}`,
    },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Jacob Paris" },
    { property: "og:locale", content: "en_US" },
  ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { getHeaderField, serverTimings } = getServerTiming()

  if (process.env.NODE_ENV === "development") {
    await import("#app/refresh.ignored.js")
  }

  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const { frontmatter, code } = await cachified({
    key: `mdx:${slug}`,
    cache,
    serverTimings,

    // Always show the cached version while we fetch a new one
    ttl: 1000 * 60 * 60,

    async getFreshValue({ background }) {
      const contentList = await getContentList()

      const content = contentList.find((content) => {
        return content.name.replace(".mdx", "") === slug
      })

      if (!content) {
        throw new Response("Not found", { status: 404 })
      }

      const file = await downloadFileBySha(content.sha)

      const compiled = await compileMdx(
        {
          slug: slug,
          content: file,
        },
        {
          priority: background ? 0 : 1,
        },
      )

      if (!compiled) {
        throw new Error("Failed to compile")
      }

      return {
        code: compiled.code,
        frontmatter: {
          ...compiled.frontmatter,
          slug,
        },
      }
    },
  })

  if (!code) {
    throw new Response("Compilation error", { status: 500 })
  }

  return json(
    {
      code,
      frontmatter,
    },
    {
      headers: {
        "cache-control": "private, max-age: 60",
        Vary: "Cookie",
        "Server-Timing": getHeaderField(),
      },
    },
  )
}

export function CatchBoundary() {
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

export default function Blog() {
  // videos are wrapped in a div with class="mx-auto max-w-full"
  const { code, frontmatter } = useLoaderData<typeof loader>()

  const Component = getMDXComponent(code)

  const url = `https://www.jacobparis.com/content/${frontmatter.slug}`

  return (
    <div>
      <div className="bg-light flex justify-center py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />
      <div className="flex">
        <article
          className="prose prose-sky lg:prose-lg min-h-screen w-full max-w-prose px-4 pt-24 sm:mx-auto sm:pl-12"
          style={{ counterReset: "footnote-counter 0" }}
        >
          {frontmatter.img ? (
            <img src={`/${frontmatter.img}`} alt="" className="w-full" />
          ) : null}
          <Link to={`/content`}>← Back to all content</Link>
          <h1 className="drop-shadow-sm">{frontmatter.title} </h1>
          <Component
            components={{
              Tweet,
              Excerpt,
              SideNote,
              SocialBannerSmall,
              LocalStorageExamples,
              FileExamples,
              DateExamples,
              SubmenuExample,
              FilterExample,
              PaginationExample,
              em: Highlight,
            }}
          />

          <footer className="text-gray-500">
            <p className="mb-5">
              If you enjoyed this post, please{" "}
              <a
                href={`https://twitter.com/intent/tweet?url=${url}`}
                rel="noopener"
                target="twitter"
              >
                let me know on Twitter!
              </a>
            </p>
          </footer>
        </article>
        <div className="hidden w-56 md:block" />
      </div>
    </div>
  )
}
