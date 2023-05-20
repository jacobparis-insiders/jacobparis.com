import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ButtonLink } from "~/components/ButtonLink"
import { getRequiredEnvVar } from "~/utils/misc"
import jwt from "./jwt.server"
import { SocialBannerSmall } from "~/components/SocialBannerSmall"
import isbot from "isbot"
export { mergeHeaders as headers } from "~/utils/misc"

export async function action({ request, params }: ActionArgs) {
  const isBot = await isbot(request.headers.get("user-agent"))

  const formData = await request.formData()
  const name = formData.get("name")
  const email = formData.get("email")
  invariant(email, "Email is required")

  const url = formData.get("url")
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600
  const payload = {
    iss: getRequiredEnvVar("GOOGLE_SHEETS_SERVICE_ACCOUNT"),
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://accounts.google.com/o/oauth2/token",
    exp,
    iat,
  }

  const jwtToken = jwt.sign(
    payload,
    getRequiredEnvVar("GOOGLE_SHEETS_PRIVATE_KEY"),
    { algorithm: "RS256" },
  )

  const { access_token } = await fetch(
    "https://accounts.google.com/o/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwtToken}`,
    },
  ).then((response) => response.json())

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const spreadsheetId = getRequiredEnvVar("GOOGLE_SHEETS_ID")
  const range = "Updates!A2"
  const values = [
    [
      date,
      name ? name.toString() : "",
      email.toString(),
      url ? url.toString() : "",
      isBot ? "Bot" : "Human",
    ],
  ]
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        range,
        values,
      }),
    },
  ).then((response) => response.json())

  if (response.error) {
    return json({ success: false, error: response.error })
  }

  return json({ success: true })
}

export default function SubscribePage() {
  const { success } = useActionData() || {}

  return (
    <div>
      <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />
      {success ? (
        <div className="mx-auto  max-w-prose px-4 py-16 font-medium sm:px-6 sm:py-24 lg:px-8 lg:py-48">
          <div className="prose-xl prose ">
            <h1 className="">Check your email!</h1>
            <p>
              There's one more thing you need to do before you'll get my emails.{" "}
            </p>

            <ol className="">
              <li> Check your inbox for an email from me. </li>
              <li> Click the confirmation link in that email. </li>
              <li> If you don't see the email, check your spam folder. </li>
              <li>
                Optional: Add <strong>jacob@jacobparis.com</strong> to your
                contacts so you don't miss any emails.
              </li>
            </ol>

            <p>Once you do that, you'll be on the list!</p>

            <p>
              By the way, if anything I write helps you build something, I'd
              love to see it.
            </p>

            <p>
              Shoot me an email or reply to any of my emails and let me know
              your thoughts!
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <ButtonLink
              className="rounded-full border border-gray-100 bg-transparent px-8 py-4 text-lg font-medium text-gray-700 hover:border-transparent"
              href="/"
            >
              <span className="mx-2 leading-6">Take me home</span>
            </ButtonLink>
          </div>
        </div>
      ) : (
        <section className="mt-32 flex items-center justify-center bg-gray-900 px-5 py-12 text-white sm:px-10">
          <div className="flex max-w-4xl flex-col ">
            <div className="mx-auto -mt-32 block">
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
                    Hey there! I'm a developer, designer, and digital nomad with
                    a background in lean manufacturing.
                  </p>
                  <p>
                    Since then, I've been working remotely around the world for
                    tech companies and startups, building great products and
                    helping others do the same.
                  </p>
                  <p>
                    About once per month, I send an email with new guides, new
                    blog posts, and sneak peeks of what's coming next.{" "}
                  </p>
                  <p>
                    Stay up to date with everything I'm working on by{" "}
                    <strong>entering your email below.</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className="">
              <div>
                <form
                  action="/emails/subscribe"
                  method="post"
                  className="flex flex-col gap-4"
                >
                  <input type="hidden" name="url" value="/emails/subscribe" />

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
      )}
    </div>
  )
}
