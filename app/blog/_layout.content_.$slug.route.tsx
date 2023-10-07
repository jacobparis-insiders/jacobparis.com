import * as React from "react"
import type {
  LinksFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getMDXComponent } from "mdx-bundler/client"
import invariant from "tiny-invariant"
import type { MdxComponent } from "~/types"

import CodeBlock from "~/components/code-block"
import blogStyles from "app/styles/blog.css"

import { Highlight } from "~/components/Highlight"
import { Tweet } from "~/components/Tweet"
import { Excerpt } from "~/components/Excerpt"
import { SideNote } from "~/components/SideNote"
import { loadMdx } from "~/utils/loadMdx"
import { ButtonLink } from "~/components/ButtonLink"
import { getMdxListItems } from "~/utils/mdx.server"
import { getServerTiming } from "~/utils/timing.server"
import { SocialBannerSmall } from "~/components/SocialBannerSmall"
import {
  DateExamples,
  FileExamples,
  LocalStorageExamples,
} from "~/examples/remix-progressive-client-only/examples"
import { SubmenuExample } from "~/examples/react-headless-submenus/content.react-headless-submenus.example.route"
import { FilterExample } from "~/examples/remix-filter-bar/content.remix-filter-bar.example.__filter._index.route"
import { PaginationExample } from "~/examples/remix-pagination/content.remix-pagination.example.__filter._index.route"
export { mergeHeaders as headers } from "~/utils/misc"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: blogStyles }]
}

export const handle = {
  id: "blog-post",
  getSitemapEntries: async (request) => {
    const pages = await getMdxListItems({ contentDirectory: "blog" })

    return pages
      .filter((page) => {
        const frontmatter = page.frontmatter ? JSON.parse(page.frontmatter) : {}

        return frontmatter.published
      })
      .map((page) => {
        return { route: `content/${page.slug}`, priority: 0.7 }
      })
  },
}

export const meta: V2_MetaFunction = ({ data, location }) => {
  if (!data) return [{ title: "Not found" }]

  const { keywords = [] } = data.frontmatter.meta ?? {}

  const titleElements = data.title
    ? [
        { title: data.title },
        { name: "twitter:title", content: data.title },
        { property: "og:title", content: data.title },
      ]
    : []

  const descriptionElements = data.description
    ? [
        { name: "description", content: data.description },
        { name: "twitter:description", content: data.description },
        { property: "og:description", content: data.description },
      ]
    : []

  const imageElements = [
    {
      name: "twitter:image",
      content: `https://www.jacobparis.com/content/${data.slug}.png`,
    },
    {
      property: "og:image",
      content: `https://www.jacobparis.com/content/${data.slug}.png`,
    },
    { name: "twitter:card", content: "summary_large_image" },
  ]
  return [
    { name: "keywords", content: keywords.join(", ") },
    ...titleElements,
    ...descriptionElements,
    ...imageElements,
    { name: "twitter:site", content: "@jacobmparis" },
    { name: "twitter:creator", content: "@jacobmparis" },
    {
      property: "og:url",
      content: `https://www.jacobparis.com/content/${data.slug}`,
    },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Jacob Paris" },
    { property: "og:locale", content: "en_US" },
  ]
}

export const loader: LoaderFunction = async ({ params }) => {
  const { time, getHeaderField } = getServerTiming()
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const response = await time("loadMdx", () => loadMdx(slug))
  response.headers.set("Server-Timing", getHeaderField())

  return response
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
            href="/"
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
  const data = useLoaderData<MdxComponent>()
  const Component = React.useMemo(() => getMDXComponent(data.code), [data])

  const url = `https://www.jacobparis.com/content/${data.slug}`

  return (
    <div>
      <div className="bg-light flex justify-center py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />
      <div className="flex">
        <article
          className="prose prose-sky mx-auto min-h-screen max-w-prose px-4 pt-24 lg:prose-lg sm:pl-12"
          style={{ counterReset: "footnote-counter 0" }}
        >
          {data.img ? (
            <img src={`/${data.img}`} alt="" className="w-full" />
          ) : null}
          <Link to={`/content`}>← Back to all content</Link>
          <h1 className="drop-shadow-sm"> {data.title} </h1>
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
              pre: CodeBlock,
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
