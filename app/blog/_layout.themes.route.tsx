import type {
  HeadersFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getSeo } from "~/utils/seo"
import { compileMdxPages, dirList, downloadMdx } from "~/utils/mdx.server"

import FromParisWithLove from "public/from-paris-with-love.json"
import StripeDocsGray from "public/stripe-docs-gray.json"
import StripeDocsBlue from "public/stripe-docs-blue.json"

import { ExternalLink } from "~/components/ExternalLink"
import { ThemePreview } from "~/components/ThemePreview"
import { getServerTiming } from "~/utils/timing.server"
import { SocialBannerSmall } from "~/components/SocialBannerSmall"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "VS Code Themes" },
    {
      name: "description",
      content: "A collection of themes I have created for VS Code",
    },
  ]
}
export { mergeHeaders as headers } from "~/utils/misc"

type LoaderData = {
  languageSamples: Awaited<ReturnType<typeof compileMdxPages>>
}

export const loader: LoaderFunction = async () => {
  const { time, getServerTimingHeader } = getServerTiming()

  const contentDirectory = "language-samples"
  const filesList = await time("getFilesInDir", () => dirList(contentDirectory))
  const pages = await time("download", () =>
    downloadMdx(filesList, contentDirectory),
  )
  const languageSamples = pages
    ? await time(
        {
          name: "content",
          description: "Compile MDX",
        },
        () => compileMdxPages(pages),
      )
    : []

  return json(
    { languageSamples },
    {
      headers: getServerTimingHeader(),
    },
  )
}

export default function Themes() {
  const { languageSamples } = useLoaderData<LoaderData>()

  return (
    <div>
      <div className="bg-light flex justify-center py-2">
        <span className="text-3xl font-medium">Jacob Paris</span>
      </div>
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />
      <section className="mx-auto min-h-screen max-w-5xl px-4 pt-24 sm:pl-12">
        <h1 className=" mb-12 text-4xl font-bold drop-shadow-sm lg:mb-16 lg:text-4xl">
          VS Code Themes
        </h1>

        <div className="flex flex-col space-y-12">
          <article>
            <div className="flex-grow">
              <h2 className="mb-8 text-4xl font-medium">
                From Paris with Love
              </h2>

              <div className="flex flex-wrap gap-x-8">
                <div className="prose prose-sky flex-grow basis-[20rem]">
                  <p>
                    A medium-contrast dark theme designed around cool colours
                    that are easy on the eyes.{" "}
                  </p>
                  <ExternalLink href="https://marketplace.visualstudio.com/items?itemName=jacobparis.from-paris-with-love">
                    <span className="sr-only">
                      From Paris with Love on the{" "}
                    </span>
                    VS Code Marketplace →
                  </ExternalLink>
                </div>
                <div className="max-w-prose flex-grow basis-[30rem] rounded-xl shadow-2xl  shadow-sky-900/50">
                  <ThemePreview
                    theme={FromParisWithLove}
                    languages={languageSamples}
                  />
                </div>
              </div>
            </div>
          </article>

          <article>
            <div className="flex-grow">
              <h2 className="mb-8 text-4xl font-medium">Stripe Docs Gray</h2>

              <div className="flex flex-wrap gap-x-8">
                <div className="max-w-prose flex-grow basis-[30rem] rounded-xl shadow-2xl  shadow-sky-900/50">
                  <ThemePreview
                    theme={StripeDocsGray}
                    languages={languageSamples}
                  />
                </div>
                <div className="prose prose-sky flex-grow basis-[20rem]">
                  <p>
                    This theme is based on the colors used in the Stripe
                    Elements documentation.{" "}
                  </p>
                  <ExternalLink href="https://marketplace.visualstudio.com/items?itemName=jacobparis.stripe-docs-theme">
                    <span className="sr-only">Stripe Docs Gray on the </span>
                    VS Code Marketplace →
                  </ExternalLink>
                </div>
              </div>
            </div>
          </article>

          <article>
            <div className="flex-grow">
              <h2 className="mb-8 text-4xl font-medium">Stripe Docs Blue</h2>

              <div className="flex flex-wrap gap-x-8">
                <div className="prose prose-sky flex-grow basis-[20rem]">
                  <p>
                    This theme is based on the colors used in the Stripe
                    documentation.{" "}
                  </p>
                  <ExternalLink href="https://marketplace.visualstudio.com/items?itemName=jacobparis.stripe-docs-theme">
                    <span className="sr-only">Stripe Docs Blue on the </span>
                    VS Code Marketplace →
                  </ExternalLink>
                </div>
                <div className="max-w-prose flex-grow basis-[30rem] rounded-xl shadow-2xl shadow-blue-900">
                  <ThemePreview
                    theme={StripeDocsBlue}
                    languages={languageSamples}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
