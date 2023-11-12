// http://localhost:3000/

import { Link, useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/node"
import { SocialBannerSmall } from "~/components/SocialBannerSmall.tsx"
import FeaturedBlogItem from "~/components/FeaturedBlogItem.tsx"
import BlogCard from "~/components/BlogCard.tsx"
import { MoultonMatrix } from "./MoultonMatrix.tsx"
import { Button } from "#app/components/ui/button.tsx"
import { Toaster, toast } from "sonner"
import { useEffect, useState } from "react"
import { Icon } from "#app/components/icon.tsx"
import { FakeUpload } from "#app/examples/remix-image-uploads/content.remix-image-uploads.example.fake.route.tsx"

export { mergeHeaders as headers } from "~/utils/misc.ts"

function sample<T>(array: Array<T>) {
  return array[Math.floor(Math.random() * array.length)]
}

export async function loader() {
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
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-white py-1" />

      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className=" relative block w-full overflow-hidden rounded-lg bg-gray-900 text-neutral-100">
          <Link
            prefetch="intent"
            to="https://www.readmoulton.com/"
            className="group block p-8"
          >
            <h3
              className="mb-4 text-2xl font-medium tracking-tight"
              style={{ wordBreak: "break-word" }}
            >
              <span className="border-blue-300 font-bold text-blue-400 group-hover:border-b-2 group-hover:text-blue-300">
                <img
                  src="/images/moulton.svg"
                  alt="Moulton logo"
                  className="mr-1 inline h-8 w-8 align-sub"
                />{" "}
                Moulton
              </span>
              , the Remix Community newsletter
            </h3>

            <p className="opacity-80">
              For the latest Remix news, tips, tutorials, libraries, and
              everything else happening in the Remix community, subscribe to the
              Moulton newsletter.
            </p>
          </Link>

          <div className="relative" aria-hidden>
            <div
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, transparent 0, rgb(16,24,39) 120%)",
              }}
              className="pointer-events-none absolute inset-0 z-10"
            />

            <MoultonMatrix />
          </div>
        </div>

        <section className="mb-16 mt-8 grid  gap-8 sm:grid-cols-2">
          <WhereToHostRemixCard />

          <BlogCard
            title="Generate open graph social preview images"
            slug="remix-og"
            img="/content/remix-og.png"
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

          <HydrationErrorsCard />

          <FeaturedBlogItem
            title="Stream Progress Updates with Remix using Defer, Suspense, and Server Sent Events"
            slug="remix-defer-streaming-progress"
            img="/content/remix-defer-streaming-progress/cover.png"
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

          <ToastCard />

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

          <ImageUploadsCard />

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

function WhereToHostRemixCard() {
  return (
    <article className="sm:col-span-2">
      <Link
        prefetch="intent"
        to="/content/where-to-host-remix"
        className="group relative block w-full overflow-hidden rounded-lg border border-gray-100 bg-white"
      >
        <div className="p-8">
          <h3
            className="mb-4 text-2xl font-medium tracking-tight"
            style={{ wordBreak: "break-word" }}
          >
            Where to host your Remix app
          </h3>

          <p className="text-gray-600">
            Should you host your Remix app on a serverless provider like Vercel,
            Fastly, Netlify, Cloudflare, or AWS Lambda? Or a long-lived server
            like Fly, Render, Railway, or DigitalOcean? This guide will help you
            choose the right hosting option for your app.
          </p>
        </div>

        <div className="relative h-48">
          <div
            style={{
              backgroundImage:
                "radial-gradient(circle at center, transparent 0, #fff 100%)",
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
  )
}

function HydrationErrorsCard() {
  return (
    <article className="sm:col-span-2">
      <Link
        prefetch="intent"
        to="/content/where-to-host-remix"
        className="group relative block w-full overflow-hidden rounded-lg border border-gray-100 bg-white"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage:
            "url(https://images.pexels.com/photos/3497624/pexels-photo-3497624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
        }}
      >
        <div className="relative h-48">
          <ul>
            {[
              {
                style: {
                  left: "5%",
                  top: "70%",
                  transform: `rotate(-10deg) translate(-50%, -50%)`,
                },
              },
              {
                style: {
                  left: "20%",
                  top: "40%",
                  transform: `rotate(0deg) translate(-50%, -50%)`,
                },
              },
              {
                style: {
                  left: "55%",
                  top: "25%",
                  transform: `rotate(10deg) translate(-50%, -50%)`,
                },
              },
              {
                style: {
                  left: "35%",
                  top: "20%",
                  transform: `rotate(-10deg) translate(-50%, -50%)`,
                },
              },
              {
                style: {
                  left: "75%",
                  top: "60%",
                  transform: `rotate(30deg) translate(-50%, -50%)`,
                },
              },
              {
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
                <div className="text-5xl font-black">?</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative px-8 py-12">
          <div className="gradient-blur absolute inset-0 rounded-md" />
          <div className="relative z-10">
            <h3
              className="mb-4 text-2xl font-medium tracking-tight text-white"
              style={{ wordBreak: "break-word" }}
            >
              Solve React hydration errors
            </h3>

            <p className="text-white opacity-60">
              Hydration errors can be caused by dates, ad blockers, browser
              extensions, invalid HTML, 3rd party scripts, CSS in JS libs,
              character encoding, IDs, and more
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}

function ToastCard() {
  useEffect(() => {
    const toastNames = [
      'Created "New Project"',
      "Successfully saved changes",
      "Deleted 3 items",
      "Copied to clipboard",
      "Added to favorites",
      "Removed from favorites",
      "Someone else just bought this item",
      "Added to cart",
      "Removed from cart",
      "Subscribed to readmoulton.com",
    ]

    const interval = setInterval(() => {
      toast(sample(toastNames))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <article className="sm:col-span-2">
      <div className="group relative block w-full  rounded-lg border border-gray-100 bg-white">
        <div className="relative h-48 [&_[data-sonner-toaster]]:!absolute">
          <Button
            onClick={() => toast("Clicked a button!")}
            className="absolute left-4 top-4 z-10"
          >
            Create new toast
          </Button>
          <Toaster
            expand={false}
            toastOptions={{
              duration: 9000,
            }}
          />
        </div>
        <Link
          prefetch="intent"
          to="/content/remix-form-toast"
          className="relative block px-8 py-12"
        >
          <div className="gradient-blur absolute inset-0 rounded-md" />
          <div className="relative z-10">
            <h3
              className="mb-4 text-2xl font-medium tracking-tight text-neutral-900"
              style={{ wordBreak: "break-word" }}
            >
              Show toast notifications with Remix
            </h3>

            <p className="text-neutral-600">
              Show the user their form submission was complete. For same-page
              submissions, try the useActionData hook. For cross-page
              submissions, use remix-toast or cookie session storage.
            </p>
          </div>
        </Link>
      </div>
    </article>
  )
}

function ImageUploadsCard() {
  return (
    <article className="">
      <div className="relative block w-full  rounded-lg border border-gray-100 bg-white">
        <div className="p-2">
          <FakeUpload />
        </div>

        <Link
          prefetch="intent"
          to="/content/remix-image-uploads"
          className="relative block px-8 py-4 pb-12"
        >
          <div className="gradient-blur absolute inset-0 rounded-md" />
          <div className="relative z-10">
            <h3
              className="mb-4 text-2xl font-medium tracking-tight text-neutral-900"
              style={{ wordBreak: "break-word" }}
            >
              Upload images with pending UI
            </h3>

            <p className="text-neutral-600">
              Upload images to a third-party service in the background, then
              display them as thumbnails before the form is submitted. Use
              drafts for cross-device persistence.
            </p>
          </div>
        </Link>
      </div>
    </article>
  )
}

function FileImage({
  src,
  alt,
  onDelete = () => {},
}: {
  src: string
  alt: string
  onDelete?: () => void
}) {
  const [createdAt] = useState(() => Date.now())
  const [fakeLoadingTime] = useState(
    () => createdAt + 2000 + Math.random() * 3000,
  )

  const [isUploading, setIsUploading] = useState(
    () => Date.now() > fakeLoadingTime,
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsUploading(true)
    }, fakeLoadingTime - Date.now())

    return () => clearTimeout(timeout)
  }, [fakeLoadingTime])

  const [isHidden, setIsHidden] = useState(false)

  if (isHidden) return null

  return (
    <div className="group relative">
      <div className="h-20 w-20 overflow-hidden rounded-xl border border-neutral-100">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{
            opacity: isUploading ? 1 : 0.5,
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setIsHidden(true)
          if (onDelete) {
            onDelete()
          }
        }}
        className="absolute -right-2 -top-2 hidden rounded-full bg-white text-black/50 hover:block hover:text-black group-hover:block"
      >
        <Icon name="cross-circled" className="h-6 w-6" />
      </button>
    </div>
  )
}
