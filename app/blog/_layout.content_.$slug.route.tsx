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
  ProgressiveDateExamples,
  ProgressiveFileExamples,
  ProgressiveLocalStorageExamples,
} from "~/examples/remix-progressive-client-only/examples.tsx"
import type { PerformanceServerTimings } from "~/utils/timing.server.ts"
import { getServerTiming } from "~/utils/timing.server.ts"

import { cache, cachified } from "#app/cache/cache.server.ts"
import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import { getContentList } from "./content.server.ts"
import { getEmail } from "../moulton/buttondown.server.ts"

import { marked } from "marked"

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

  const translationElements = (data.frontmatter.translations || []).map(
    ({ lang, href }) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: lang,
      href,
    }),
  )

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
    ...translationElements,
  ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { getHeaderField, serverTimings } = getServerTiming()

  if (process.env.NODE_ENV === "development") {
    await import("#app/refresh.ignored.js")
  }

  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  if (slug.startsWith("moulton-")) {
    const { type, code, frontmatter } = await getMoultonContent({
      slug,
      serverTimings,
    })

    return json(
      { type, code, frontmatter },
      {
        headers: {
          "cache-control": "private, max-age: 60",
          Vary: "Cookie",
          "Server-Timing": getHeaderField(),
        },
      },
    )
  } else {
    const { type, code, frontmatter } = await getJacobParisContent({
      slug,
      serverTimings,
    })

    return json(
      { type, code, frontmatter },
      {
        headers: {
          "cache-control": "private, max-age: 60",
          Vary: "Cookie",
          "Server-Timing": getHeaderField(),
        },
      },
    )
  }
}

async function getJacobParisContent({
  slug,
  serverTimings,
}: {
  slug: string
  serverTimings: PerformanceServerTimings
}) {
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

  return {
    type: "mdx" as const,
    code,
    frontmatter,
  }
}
async function getMoultonContent({
  slug,
  serverTimings,
}: {
  slug: string
  serverTimings: PerformanceServerTimings
}) {
  const id = slug.replace("moulton-", "")

  const compiled = await cachified({
    cache,
    key: `compiled_email:${id}`,
    serverTimings,
    async getFreshValue() {
      const content = await getEmail({ id })
      if (content.code === "success") {
        return {
          ...content.data,
          body: await marked(content.data.body),
        }
      }
      return null
    },
  })

  if (!compiled) {
    throw new Error("Failed to compile")
  }

  return {
    type: "md" as const,
    code: compiled.body,
    frontmatter: {
      slug,
      title: compiled.subject,
      description: compiled.description,
      img: null,
      translations: [] as Array<{ lang: string; href: string; label: string }>,
    },
  }
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

function RenderedContent({ type, code }: { type: "md" | "mdx"; code: string }) {
  if (type === "md") {
    return <div dangerouslySetInnerHTML={{ __html: code }} />
  }

  if (type === "mdx") {
    const Component = getMDXComponent(code)

    return (
      <Component
        components={{
          Tweet,
          Excerpt,
          SideNote,
          SocialBannerSmall,
          LocalStorageExamples,
          ProgressiveLocalStorageExamples,
          FileExamples,
          ProgressiveFileExamples,
          DateExamples,
          ProgressiveDateExamples,
          SubmenuExample,
          FilterExample,
          PaginationExample,
          YoutubeVideo,
          em: Highlight,
        }}
      />
    )
  }

  throw new Error("Invalid type")
}

export default function Blog() {
  // videos are wrapped in a div with class="mx-auto max-w-full"
  const { type, code, frontmatter } = useLoaderData<typeof loader>()

  const url = `https://www.jacobparis.com/content/${frontmatter.slug}`

  return (
    <div>
      <div className="relative z-40 flex justify-center bg-[#f5f5f5] py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light shadow-smooth sticky top-0 z-30 mb-8 border-b border-neutral-200 py-1" />
      <div className="flex">
        <article
          className="prose prose-neutral lg:prose-lg prose-code:before:hidden prose-code:after:hidden prose-blockquote:bg-white min-h-screen w-full max-w-prose px-4 pt-24 sm:mx-auto sm:pl-12"
          style={{ counterReset: "footnote-counter 0" }}
        >
          {frontmatter.img ? (
            <img src={`/${frontmatter.img}`} alt="" className="w-full" />
          ) : null}
          <Link to={`/content`}>← Back to all content</Link>
          <h1 className="drop-shadow-sm">{frontmatter.title} </h1>
          {frontmatter.translations?.length ? (
            <ul className="" aria-label="Translations">
              {frontmatter.translations.map(({ lang, label, href }) => (
                <li key={lang}>
                  <Link to={href} className="hover:text-sky-600">
                    {label} <span className="sr-only"> translation </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <RenderedContent type={type} code={code} />

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

function YoutubeVideo({ videoId }: { videoId: string }) {
  return (
    <div className="rounded-lg bg-white p-2 shadow-sm">
      <iframe
        className="mx-auto max-w-full rounded"
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
