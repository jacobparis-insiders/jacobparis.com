// http://localhost:3000/

import dotStylesheetHref from "~/styles/dot.css"

import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node"

import { useRootLoaderData } from "~/root.tsx"
import { Link, useLoaderData } from "@remix-run/react"
import { SubscribeForm } from "./subscribe.route.tsx"
import { getLatestContent } from "./buttondown.server.ts"
import { SocialBannerSmall } from "#app/components/SocialBannerSmall.tsx"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: dotStylesheetHref },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const content = await getLatestContent()

  if (content.code === "success") {
    const latestEmail = content.data.results[0]
    if (latestEmail.publish_date) {
      return json({
        lastPublished: new Date(latestEmail.publish_date).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
      })
    }
  }

  return json({
    lastPublished: null,
  })
}

export default function Index() {
  const { user, subscriber } = useRootLoaderData()
  const { lastPublished } = useLoaderData<typeof loader>()

  return (
    <div className="h-full bg-gray-900  text-gray-200 lg:pb-14">
      <SocialBannerSmall className="bg-glass top-0 z-30 mb-8 border-b border-slate-700 py-1" />

      <div className="mx-auto max-w-7xl px-8">
        {lastPublished ? (
          <div className="prose prose-invert sm:prose-lg space-y-5 rounded-lg bg-sky-900 px-6 py-4 text-white/80">
            <p>
              The most recent email was sent on <strong>{lastPublished}</strong>
              .
            </p>
          </div>
        ) : null}

        <h1 className="mt-12 text-2xl sm:text-3xl">
          Keep up on everything new in the Remix Community
        </h1>

        <section className="mt-12 bg-gray-900">
          <div className="flex max-w-5xl flex-col gap-24 lg:flex-row lg:justify-between">
            <div className="relative z-10 font-medium">
              <div className="prose prose-invert  sm:prose-lg space-y-5">
                <p>
                  Hey folks! It's Jacob Paris here with the Moulton newsletter.
                </p>
                <p>
                  About once per month, I send an email with the latest Remix
                  community news, including:
                </p>
                <ul>
                  <li> New guides and tutorials </li>
                  <li> Upcoming talks, meetups, and events </li>
                  <li> Cool new libraries and packages </li>
                  <li> What's new in the latest versions of Remix </li>
                </ul>
                <br />
                <p>
                  Stay up to date with everything in the Remix community by
                  <strong> entering your email below. </strong>
                </p>
              </div>
            </div>
            <div className="relative" aria-hidden>
              <div className="absolute mt-12">
                <div className="flex">
                  <div className="relative h-[250px] w-[250px]">
                    <span className="dot" />
                  </div>
                  <aside className="relative h-[250px] w-[250px]">
                    <span className="dot" />
                  </aside>
                </div>
                <div className="flex">
                  <aside className="relative h-[250px] w-[250px]">
                    <span className="dot" />
                  </aside>
                  <aside className="relative h-[250px] w-[250px]">
                    <span className="dot" />
                  </aside>
                </div>
              </div>

              {user ? (
                <div className="relative">
                  <div className="bg-glass min-w-[20rem] overflow-hidden rounded-lg border border-slate-700 px-8 py-4 sm:mx-auto lg:mx-0">
                    {subscriber.type === "regular" ? (
                      <>
                        <h2 className="text-2xl font-bold">
                          You&rsquo;re subscribed!
                        </h2>
                        <p className="mt-2">
                          When the next newsletter is ready, it'll be sent to{" "}
                          <strong>{user.email}</strong>
                        </p>
                        <Link
                          to="/content"
                          className="mt-4 inline-block rounded-md bg-emerald-400 px-4 py-2 font-medium text-black shadow-sm hover:bg-green-500"
                        >
                          View subscriber content
                        </Link>
                      </>
                    ) : subscriber.type === "unactivated" ? (
                      <>
                        <h2 className="text-2xl font-bold">
                          Check your email!
                        </h2>
                        <p className="mt-2">
                          You still need to{" "}
                          <Link
                            to="/subscribe/success"
                            className="text-sky-400 hover:text-sky-500 hover:underline"
                          >
                            confirm your email
                          </Link>{" "}
                          before you&rsquo;ll start getting the newsletter.
                        </p>
                      </>
                    ) : subscriber.type === "unsubscribed" ? (
                      <>
                        <h2 className="text-2xl font-bold">
                          You&rsquo;re unsubscribed!
                        </h2>
                        <p className="mt-2">
                          Thanks for subscribing to the Moulton newsletter!
                          You'll be hearing from me soon.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">
                          There might be an issue with your subscription
                        </h2>
                        <p className="mt-2">
                          Thanks for subscribing to the Moulton newsletter!
                          You'll be hearing from me soon.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative pl-12">
                  <SubscribeForm />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
