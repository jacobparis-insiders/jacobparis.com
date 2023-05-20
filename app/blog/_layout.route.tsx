import { Outlet, useLocation } from "@remix-run/react"

import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"

type LoaderData = {
  greeting: string
}

function sample(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)]
}

export const loader: LoaderFunction = async () => {
  const greeting = sample(["Hi, I'm ", "Hey, I'm ", "It's ", "Hey there, I'm "])

  return json<LoaderData>({
    greeting,
  })
}

export default function Index() {
  const location = useLocation()

  return (
    <>
      <div>
        <div className="flex flex-1 flex-col">
          <main className="relative flex-1">
            <Outlet />

            <section className="mt-32 flex items-center justify-center bg-gray-900 px-5 py-12 text-white sm:px-10">
              <div className="flex max-w-4xl flex-col md:flex-row md:gap-10">
                <div className="mx-auto -mt-32 block  md:hidden">
                  <img
                    src="/images/jacob.jpg"
                    className="h-48 w-48 rounded-full shadow"
                    alt="Professional headshot"
                  />
                </div>
                <div className="relative z-10 flex-1 py-10 font-medium">
                  <h2 className="text-2xl sm:text-3xl">Hi, I'm Jacob</h2>
                  <div className="prose prose-invert max-w-md space-y-5 pt-5 opacity-80 sm:prose-lg">
                    <div>
                      <p>
                        Hey there! I'm a developer, designer, and digital nomad
                        with a background in lean manufacturing.
                      </p>
                      <p>
                        About once per month, I send an email with new guides,
                        new blog posts, and sneak peeks of what's coming next.{" "}
                      </p>
                      <p>
                        <strong>
                          Everyone who subscribes gets access to the source code
                          for this website and every example project for all my
                          tutorials.
                        </strong>
                      </p>
                      <p>
                        Stay up to date with everything I'm working on by{" "}
                        <strong>entering your email below.</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="mx-auto hidden md:-mt-40 md:block">
                    <img
                      src="/images/jacob.jpg"
                      className="h-48 w-48 rounded-full shadow"
                      alt="Professional headshot"
                    />
                  </div>
                  <div>
                    <form
                      action="/emails/subscribe"
                      method="post"
                      className="flex flex-col gap-4"
                    >
                      <input
                        type="hidden"
                        name="url"
                        value={`${location.pathname}${location.search}`}
                      />

                      <div className="flex flex-col gap-2">
                        <label htmlFor="cta-name" className="font-medium">
                          First name
                        </label>
                        <input
                          id="cta-name"
                          type="text"
                          name="name"
                          required
                          className="block w-full rounded-md border border-gray-100 px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-600"
                          placeholder="Preferred name"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="cta-email" className="font-medium">
                          Email address
                        </label>
                        <input
                          id="cta-email"
                          type="email"
                          name="email"
                          required
                          className="block w-full rounded-md border border-gray-100 px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-600"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="">
                        <button
                          type="submit"
                          className="block w-full rounded-md border border-transparent bg-sky-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-600 sm:px-10"
                        >
                          Sign up today
                        </button>
                      </div>

                      <p className="mx-auto max-w-xs text-center text-sm ">
                        Unsubscribe at any time.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  )
}
