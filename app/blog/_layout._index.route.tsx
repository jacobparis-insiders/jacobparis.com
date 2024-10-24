// http://localhost:3000/

import { Link } from "@remix-run/react"
import { SocialBannerSmall } from "~/components/SocialBannerSmall.tsx"
import { BlogItem } from "./_layout.content._index.route.tsx"
import { Icon } from "#app/components/icon.tsx"
import clsx from "clsx"
import type { IconName } from "#app/components/icons/names.ts"
import Cal, { getCalApi } from "@calcom/embed-react"
import { useEffect } from "react"

export { mergeHeaders as headers } from "~/utils/misc.ts"

export default function Index() {
  return (
    <div className="">
      <div className="relative z-40 bg-[#f5f5f5]">
        <section className="mx-auto flex max-w-4xl flex-wrap gap-8 px-4 py-8 sm:px-8">
          <div
            className="flex-grow text-center font-medium"
            style={{ flexBasis: "25rem" }}
          >
            <h1 className="text-5xl ">Jacob Paris</h1>

            <h2 className="mx-auto mt-4 max-w-[35ch] text-xl ">
              Full stack product developer
            </h2>
          </div>
        </section>
      </div>
      <SocialBannerSmall className="bg-light shadow-smooth sticky top-0 z-30 mb-8 border-b border-neutral-200 py-1" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="grid grid-cols-4 gap-4">
          <Badge
            icon="epic-web"
            href="https://epicweb.dev"
            title="Epic Web"
            description="Instructor"
            className="bg-gradient-to-r from-indigo-600 to-blue-600"
          />
          <Badge
            icon="egghead"
            href="https://egghead.io"
            title="Egghead"
            description="Instructor"
            className="bg-neutral-800"
          />
          <Badge
            icon="moulton"
            href="/moulton"
            title="Moulton"
            description="Writer"
            className="bg-sky-700"
          />
          <Badge
            icon="clipboard-copy"
            href="/sly"
            title="Sly CLI"
            description="Maintainer"
            className="bg-neutral-800"
          />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
        <h2 className="text-4xl font-bold"> Featured content </h2>

        <ol className="mt-4 grid gap-x-8 gap-y-2">
          <BlogItem
            title="Where to host your Remix app in 2024"
            slug="where-to-host-remix"
            timestamp="April 4, 2024"
          />

          <BlogItem
            title="Solve hydration issues in Remix/Next apps"
            slug="remix-hydration-errors"
            timestamp={"November 7, 2023"}
          />

          <BlogItem
            title="Generate open graph social preview images"
            slug="remix-og"
            timestamp={"November 4, 2023"}
          />

          <BlogItem
            title="Build a server-side filter UI with Remix"
            slug="remix-filter-bar"
            timestamp="September 17, 2023"
          />

          <BlogItem
            title="Use SVG sprite icons in React"
            slug="svg-icons"
            timestamp="July 22, 2023"
          />

          <li className="py-8 text-center">
            <Link
              to="/content"
              className="inline-block rounded-full border border-gray-100 bg-transparent px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-200 hover:text-black"
            >
              Explore all content
            </Link>
          </li>
        </ol>
      </div>

      <div style={{ minHeight: "570px" }}>
        <CalEmbed />
      </div>
    </div>
  )
}

function CalEmbed() {
  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: "consult" })
      cal("ui", {
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      })
    })()
  }, [])

  return (
    <Cal
      namespace="consult"
      calLink="jacobparis/consult"
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
      config={{ layout: "month_view" }}
    />
  )
}

function Badge({
  className,
  icon,
  href,
  title,
  description,
}: {
  className?: string
  icon: IconName
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      to={href}
      className={clsx(
        "group col-span-4 flex items-center gap-4 rounded-2xl bg-neutral-800 p-4 text-white transition-all hover:shadow-2xl sm:col-span-2 lg:col-span-1",
        className,
      )}
    >
      <div>
        <Icon
          aria-hidden
          name={icon}
          className="h-10 w-10 self-start text-white transition-transform ease-in-out group-hover:-rotate-12 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl leading-5">{title}</span>
        <span className="leading-4 opacity-80">{description}</span>
      </div>
    </Link>
  )
}
