import type { MetaFunction } from "@remix-run/node"
import { Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { ButtonLink } from "~/components/ButtonLink.tsx"
import { SocialBannerSmall } from "~/components/SocialBannerSmall.tsx"

export { mergeHeaders as headers } from "~/utils/misc.ts"

export const meta: MetaFunction = ({ params }) => {
  return [
    {
      title: "UI | Jacob Paris",
    },
  ]
}

export const handle = {
  id: "ui",
  getSitemapEntries: async () => {
    return [
      {
        route: `ui`,
        priority: 0.7,
      },
    ]
  },
}

export default function UI() {
  return (
    <div>
      <div className="relative z-40 flex justify-center bg-[#f5f5f5] py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light shadow-smooth sticky top-0 z-30 mb-8 border-b border-neutral-200 py-1" />

      <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-8">
        <Outlet />
      </div>
    </div>
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
