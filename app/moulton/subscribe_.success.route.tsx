// http://localhost:3000/subscribe/success

import {
  redirect,
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { authenticator } from "./auth.server.ts"
import { getSubscriber, resendConfirmationEmail } from "./buttondown.server.ts"

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)

  if (!user) {
    throw authenticator.logout(request, { redirectTo: "/" })
  }

  await resendConfirmationEmail({ email: user.email })

  return json({ status: "success" as const })
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)

  if (!user) {
    throw redirect("/")
  }

  const subscriber = await getSubscriber({
    email: user.email,
    forceFresh: true,
  })
  if (subscriber.code !== "success") {
    await authenticator.logout(request, { redirectTo: "/" })
    return
  }

  if (subscriber.data.subscriber_type !== "unactivated") {
    throw redirect("/content")
  }

  return null
}
export default function SubscribeSuccess() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="h-full bg-gray-900 pt-10 text-white sm:pt-16 lg:pb-14 lg:pt-8">
      <div className="mx-auto max-w-7xl px-8">
        <h1 className="text-4xl font-extrabold tracking-tight  sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
          <span className="block bg-gradient-to-r from-teal-200 to-cyan-400 bg-clip-text pb-3 text-transparent sm:pb-5">
            Moulton
          </span>
        </h1>

        <h2 className="mt-12 text-2xl sm:text-3xl">
          Not done yet – check your email!
        </h2>

        {actionData?.status === "success" ? (
          <div className="mb-4 mt-8 max-w-prose rounded-md border-b-2 border-black bg-emerald-400 px-4 py-3 font-medium text-black shadow-sm">
            <p className="text-lg">
              A confirmation email has just been sent to your inbox.
            </p>
          </div>
        ) : null}
        <div className="prose-xl prose-invert mt-12">
          <p>
            There's one more thing you need to do before you'll start getting
            emails.{" "}
          </p>

          <ul className="ml-8 list-disc">
            <li> Check your inbox for an email from readmoulton.com. </li>
            <li> Click the confirmation link in that email. </li>
            <li> If you don't see the email, check your spam folder. </li>
            <li>
              You can{" "}
              {actionData?.status !== "success" ? (
                <Form
                  method="POST"
                  reloadDocument
                  className="inline text-sky-400 hover:text-sky-500 hover:underline"
                >
                  <button> request another email </button>
                </Form>
              ) : (
                "request another email"
              )}{" "}
              if you need to.
            </li>
            <li>
              Optional: Add <strong>hi@readmoulton.com</strong> to your contacts
              so you don't miss any emails.
            </li>
          </ul>

          <p>Once you do that, you'll be on the list!</p>

          <p>
            By the way, if you have any feedback or ideas you'd like to share
            with the Remix community, I'd love to hear from you.
          </p>

          <p>
            Shoot me an email or reply to any of my emails and let me know your
            thoughts!
          </p>
        </div>
      </div>
    </div>
  )
}
