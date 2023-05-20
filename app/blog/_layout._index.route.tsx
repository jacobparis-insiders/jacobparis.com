import { Link, useLoaderData } from "@remix-run/react"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import BlogItem from "~/components/blog-item"
import { compileMdxPages, dirList, downloadMdx } from "~/utils/mdx.server"
import FromParisWithLove from "public/from-paris-with-love.json"
import { ThemePreview } from "~/components/ThemePreview"
import { ButtonLink } from "~/components/ButtonLink"
import { FakeBrowser } from "~/components/FakeBrowser"
import { TwoColumnSection } from "~/components/TwoColumnSection"
import { ExternalLink } from "~/components/ExternalLink"
import { SocialBannerSmall } from "~/components/SocialBannerSmall"
import { DevicePhoneMobileIcon } from "@heroicons/react/20/solid"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import FeaturedBlogItem from "~/components/FeaturedBlogItem"
import BlogCard from "~/components/BlogCard"

export { mergeHeaders as headers } from "~/utils/misc"

function sample<T>(array: Array<T>) {
  return array[Math.floor(Math.random() * array.length)]
}

export const loader: LoaderFunction = async () => {
  const greeting = sample(["Hi, I'm ", "Hey, I'm ", "It's ", "Hey there, I'm "])

  return json({ greeting })
}

export default function Index() {
  const { greeting } = useLoaderData<typeof loader>()
  return (
    <div className="">
      <div className="bg-light">
        <section className="mx-auto flex max-w-4xl flex-wrap gap-8 px-4 py-8 sm:px-8">
          <div
            className="flex-grow text-center font-medium"
            style={{ flexBasis: "25rem" }}
          >
            <p aria-hidden className="text-4xl">
              {greeting}
            </p>

            <h1 className="mb-8 text-5xl ">Jacob Paris</h1>

            <h2 className="mx-auto max-w-[35ch] text-xl ">
              I'm here to make you a better developer by teaching you everything
              I know about building for the web.
            </h2>
          </div>
        </section>
      </div>
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />

      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <h2 className="mb-4 text-xl font-medium text-gray-700">
          Write better web applications with these free tutorials and articles.
        </h2>

        <section className="grid gap-8  sm:grid-cols-2">
          <FeaturedBlogItem
            title="Stream Progress Updates with Remix using Defer, Suspense, and Server Sent Events"
            slug="remix-defer-streaming-progress"
            img="/content/remix-defer-streaming-progress/cover.png"
            tags="Remix"
          />

          <BlogCard
            title="Generate open graph social preview images with Remix"
            slug="remix-og"
            img="https://www.jacobparis.com/generators/blog.png?title=Generate%2520open%2520graph%2520social%2520preview%2520images%2520with%2520Remix&description=Learn%2520how%2520to%2520generate%2520social%2520preview%2520images%2520for%2520your%2520website%2520with%2520Remix%2520and%2520Tailwind.%2520Use%2520Vercel%27s%2520Satori%2520package%2520with%2520Remix%2520for%2520dynamic%2520open%2520graph%2520images.%2520Fetch%2520fonts%2520from%2520Google%2520automatically.&date=2023-04-09&img="
            tags="Remix"
            className="row-span-2"
          />

          <BlogCard
            title="Animated page transitions with Remix's nested routes"
            slug="remix-animated-page-transitions"
            tags="Remix, UI/UX"
          />

          <BlogCard
            title="Multi-step forms with Remix"
            slug="remix-multi-step-forms"
            tags="Remix, UI/UX"
          />

          <BlogCard
            title="Show active user presence (like Google Docs or Figma) with Remix"
            slug="remix-presence"
            tags="Remix, UI/UX"
          />

          <BlogCard
            title="Develop and deploy multiple Remix apps with an integrated Nx monorepo"
            slug="remix-nx-monorepo"
            img="/content/develop-remix-apps-nx-monorepo/cover.png"
            tags="Remix, Nx, Integrations"
            className="row-span-2"
          />

          <BlogCard
            title="Find and fix performance bottlenecks in your Remix app with Server Timing"
            slug="remix-server-timing"
            tags="Remix"
            className=""
          />

          <BlogCard
            title="Add data to a Google Sheet from a Node.js backend"
            slug="submit-form-google-sheet"
            img="/content/submit-form-google-sheet/cover.png"
            tags="Forms, Integrations"
            className="row-span-2"
          />

          <BlogCard
            title="3 runtime validation libraries for Typescript that all look the same to me"
            slug="typescript-runtime-validation"
            tags="Typescript, Reviews"
          />

          <BlogCard
            title="Write a type-safe singleton module in Typescript"
            slug="type-safe-singleton-modules"
            tags="Typescript"
          />

          <BlogCard
            title="The state of type-safe data fetching"
            slug="type-safe-data-fetching"
            tags="Typescript, Remix, Reviews"
          />

          <BlogCard
            title="Build a sticky hover effect with Tailwind and React"
            slug="ios-hover-tailwind"
            img="/content/ios-hover-tailwind/cover.png"
            tags="React, Tailwind"
            className="row-span-2"
          />

          <BlogCard
            title="Where to host your Remix app in 2023"
            slug="where-to-host-remix"
            tags="Remix"
          />
        </section>

        <div className="py-8 text-center">
          <Link
            to="/content"
            className="inline-block rounded-full border border-gray-100 bg-transparent px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-200 hover:text-black"
          >
            Explore all content
          </Link>
        </div>
      </div>
    </div>
  )
}
