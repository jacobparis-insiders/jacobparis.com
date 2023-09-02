import { Outlet, useLocation } from "@remix-run/react"

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
                <div className="relative z-10 flex-1 font-medium">
                  <div className="flex items-center gap-x-8">
                    <div className="flex w-full items-center justify-between md:w-auto">
                      <span className="sr-only">Moulton</span>
                      <img
                        className="h-8 w-auto sm:h-10"
                        src="https://www.readmoulton.com/logo.svg"
                        alt=""
                      />
                    </div>

                    <div className="text-5xl font-extrabold tracking-tight sm:mt-5">
                      <span className="block bg-gradient-to-r from-sky-400 to-teal-200 bg-clip-text pb-3 text-transparent sm:pb-5">
                        Moulton
                      </span>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-md space-y-5 opacity-80 sm:prose-lg">
                    <div>
                      <p>
                        Hey there! I'm a developer, designer, and digital nomad
                        building cool things with Remix, and I'm also writing{" "}
                        <a
                          href="https://www.readmoulton.com/"
                          className="text-sky-300"
                        >
                          Moulton, the Remix Community Newsletter
                        </a>
                      </p>
                      <p>About once per month, I send an email with:</p>
                      <ul>
                        <li> New guides and tutorials </li>
                        <li>Upcoming talks, meetups, and events</li>
                        <li>Cool new libraries and packages</li>
                        <li>What's new in the latest versions of Remix</li>
                      </ul>
                      <p>
                        Stay up to date with everything in the Remix community
                        by <strong>entering your email below.</strong>
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
                      action="https://www.readmoulton.com/subscribe"
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
