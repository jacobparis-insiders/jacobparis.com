// http://localhost:3000/

import { Link, useLoaderData } from "@remix-run/react"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { SocialBannerSmall } from "~/components/SocialBannerSmall"
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
        <Link to="https://github.com/jacobparis-insiders/" className="group">
          <aside className="mb-6 flex items-center gap-x-4 rounded-2xl bg-gray-900 px-3 py-3 text-white opacity-90 transition-opacity  group-hover:opacity-60">
            <img
              src="/images/jacob.png"
              className="w-12 rounded-lg shadow"
              alt="Professional headshot"
            />
            <div>
              <p className="font-medium">
                Hey there! I've open sourced my site and examples to all free
                newsletter subscribers.
              </p>
              <p className="opacity-80">
                Join the mailing list and I will send you an invite to the
                repository.{" "}
              </p>
            </div>
          </aside>
        </Link>

        <div className="mb-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-white to-75%" />
            <img
              src="/remix.svg"
              alt="Remix logo"
              width="200"
              // mask linear gradient to transparent top to bottom
              className="mx-auto -mb-16"
            />
          </div>
          <h2 className="relative mb-4 text-7xl font-bold ">Remix</h2>
          <p className="mx-auto max-w-xs text-xl font-medium text-gray-700">
            Full stack React apps with SSR and declarative data fetching
          </p>
        </div>

        <section className="mb-16 grid  gap-8 sm:grid-cols-2">
          <article className="sm:col-span-2">
            <Link
              prefetch="intent"
              to="/content/where-to-host-remix"
              className="group relative block w-full overflow-hidden rounded-lg border border-gray-100 bg-[#f4f4f4]"
            >
              <div className="p-8">
                <h3
                  className="mb-4 text-2xl font-medium tracking-tight"
                  style={{ wordBreak: "break-word" }}
                >
                  Where to host your Remix app
                </h3>

                <p className="text-gray-600">
                  Should you host your Remix app on a serverless provider like
                  Vercel, Fastly, Netlify, Cloudflare, or AWS Lambda? Or a
                  long-lived server like Fly, Render, Railway, or DigitalOcean?
                  This guide will help you choose the right hosting option for
                  your app.
                </p>
              </div>

              <div className="relative h-48">
                <div
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at center, transparent 0, #f4f4f4 100%)",
                  }}
                  className="absolute inset-0 z-10 "
                />
                <ul>
                  {[
                    {
                      src: "/netlify.png",
                      alt: "placekitten",
                      style: {
                        left: "5%",
                        top: "70%",
                        transform: `rotate(-10deg) translate(-50%, -50%)`,
                      },
                    },
                    {
                      src: "/vercel-icon-dark.svg",
                      alt: "placekitten",
                      style: {
                        left: "80%",
                        top: "0%",
                      },
                    },
                    {
                      src: "/fastly.svg",
                      alt: "placekitten",
                      style: {
                        left: "20%",
                        top: "40%",
                        transform: `rotate(0deg) translate(-50%, -50%)`,
                      },
                    },
                    {
                      src: "/cloudflare.svg",
                      alt: "placekitten",
                      style: {
                        left: "55%",
                        top: "25%",
                        transform: `rotate(10deg) translate(-50%, -50%)`,
                      },
                    },
                    {
                      src: "/aws.svg",
                      alt: "placekitten",
                      style: {
                        left: "35%",
                        top: "20%",
                        transform: `rotate(-10deg) translate(-50%, -50%)`,
                      },
                    },
                    {
                      src: "/fly.svg",
                      alt: "placekitten",
                      style: {
                        left: "75%",
                        top: "60%",
                        transform: `rotate(30deg) translate(-50%, -50%)`,
                      },
                    },
                    {
                      src: "/digitalocean.svg",
                      alt: "placekitten",
                      style: {
                        left: "45%",
                        top: "50%",
                        transform: `rotate(-20deg) translate(-50%, -50%)`,
                      },
                    },
                  ].map((image, index) => (
                    <li
                      key={index}
                      className="absolute h-16 w-16 transition-all group-hover:h-20 group-hover:w-20"
                      style={image.style}
                    >
                      <div>
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          </article>

          <BlogCard
            title="Generate open graph social preview images"
            slug="remix-og"
            img="https://www.jacobparis.com/generators/blog.png?title=Generate%2520open%2520graph%2520social%2520preview%2520images%2520with%2520Remix&description=Learn%2520how%2520to%2520generate%2520social%2520preview%2520images%2520for%2520your%2520website%2520with%2520Remix%2520and%2520Tailwind.%2520Use%2520Vercel%27s%2520Satori%2520package%2520with%2520Remix%2520for%2520dynamic%2520open%2520graph%2520images.%2520Fetch%2520fonts%2520from%2520Google%2520automatically.&date=2023-04-09&img="
            tags="Remix"
            className="row-span-2"
          />

          <BlogCard
            title="Find and fix performance bottlenecks with Server Timing"
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
            title="Where to host your Remix app in 2023"
            slug="where-to-host-remix"
            tags="Remix"
          />

          <FeaturedBlogItem
            title="Stream Progress Updates with Remix using Defer, Suspense, and Server Sent Events"
            slug="remix-defer-streaming-progress"
            img="/content/remix-defer-streaming-progress/cover.png"
            tags="Remix"
          />
          <BlogCard
            title="Solving hydration errors"
            slug="remix-hydration-errors"
            tags="Remix"
          />

          <BlogCard
            title="Custom Fetcher Hooks are Remix's Typesafe RPCs"
            slug="remix-rpc-pattern"
            tags="Remix"
          />
          <BlogCard
            title="Autosave form inputs on change or blur"
            slug="remix-form-autosave"
            tags="Remix"
          />

          <BlogCard
            title="Show toast notifications on form submit"
            slug="remix-form-toast"
            tags="Remix"
          />
        </section>

        <div className="mb-8 text-center">
          <h2 className="relative mb-4 text-7xl font-bold ">UI Engineering</h2>
          <p className="mx-auto max-w-sm text-xl font-medium text-gray-700">
            Creating delightful user experiences with React and Tailwind
          </p>
        </div>

        <section className="grid gap-8  sm:grid-cols-2">
          <BlogCard
            title="Animated page transitions with nested routes"
            slug="remix-animated-page-transitions"
            tags="Remix, UI/UX"
          />
          <BlogCard
            title="Show active user presence (like Google Docs or Figma)"
            slug="remix-presence"
            tags="Remix, UI/UX"
          />
          <BlogCard
            title="Build a sticky hover effect with Tailwind and React"
            slug="ios-hover-tailwind"
            img="/content/ios-hover-tailwind/cover.png"
            tags="React, Tailwind"
            className="row-span-2"
          />
          <BlogCard
            title="Multi-step forms"
            slug="remix-multi-step-forms"
            tags="Remix, UI/UX"
          />
          <BlogCard
            title="Guidelines for optimistic UI in modern apps"
            slug="remix-crud-ui"
            tags="Remix"
          />
          <BlogCard
            title="Uploading images with optimistic UI (like Slack)"
            slug="remix-image-uploads"
            tags="Remix"
          />
          <BlogCard
            title="Progressively enhanced client rendering"
            slug="remix-progressive-client-only"
            tags="Remix"
          />
          <BlogCard
            title="Building a markdown input with a preview tab (like GitHub and Stack
          Overflow)"
            slug="remix-markdown-preview"
            tags="Remix"
          />

          <BlogCard
            title="Show a loading state while images load"
            slug="image-placeholders"
            tags="Advanced"
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
