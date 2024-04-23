import { cachified, cache, clearKey } from "#app/cache/cache.server.ts"
import { z } from "zod"

const baseUrl = "https://api.buttondown.email"

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  notes: z.string(),
  metadata: z.object({
    name: z.string().optional(),
  }),
  tags: z.array(z.string()),
  referrer_url: z.string(),
  creation_date: z.string(),
  secondary_id: z.number(),
  subscriber_type: z.string(),
  source: z.string(),
  utm_campaign: z.string(),
  utm_medium: z.string(),
  utm_source: z.string(),
  referral_code: z.string(),
  avatar_url: z.string(),
  stripe_customer_id: z.string().nullable(),
  unsubscription_date: z.string().nullable(),
  churn_date: z.string().nullable(),
  unsubscription_reason: z.string(),
  transitions: z.array(z.object({})),
})

export async function createSubscriber({
  email,
  name,
  url,
}: {
  email: string
  name?: string
  url?: string
}) {
  const response = await fetchButtondown(`/v1/subscribers`, {
    method: "post",
    body: JSON.stringify({
      email,
      referrer_url: url ?? "",
      metadata: {
        name,
      },
      tags: ["test"],
    }),
  })

  try {
    if (response.ok) {
      return {
        code: "success" as const,
        data: userSchema.parse(response.data),
      }
    } else {
      return z
        .discriminatedUnion("code", [
          z.object({
            code: z.literal("email_already_exists"),
            detail: z.string(),
            metadata: z.object({
              subscriber_id: z.string(),
            }),
          }),
        ])
        .parse(response.error)
    }
  } catch (error) {
    console.error("Error creating subscriber")
    console.log(JSON.stringify(response, null, 2))
    return {
      code: "error" as const,
      detail: error,
    }
  }
}

export async function getSubscriber({ email }: { email: string }) {
  const response = await cachified({
    cache,
    key: `subscriber:${email}`,
    ttl: 1000 * 60,
    staleWhileRevalidate: 1000 * 60 * 5,
    async getFreshValue() {
      return fetchButtondown(`/v1/subscribers/${email}`, {
        method: "GET",
      })
    },
  })

  try {
    if (response.ok) {
      return {
        code: "success" as const,
        data: userSchema.parse(response.data),
      }
    }

    return z
      .discriminatedUnion("code", [
        z.object({
          code: z.literal("not_found"),
          detail: z.string(),
        }),
        z.object({
          code: z.literal("unsubscribed"),
          detail: z.string(),
        }),
        z.object({
          code: z.literal("timeout"),
          detail: z.string(),
        }),
      ])
      .parse(response.error)
  } catch (error) {
    console.error("Error getting subscriber", response)
    return {
      code: "error" as const,
    }
  }
}

export async function upsertSubscriber({
  email,
  name,
  url,
}: {
  email: string
  name?: string
  url?: string
}) {
  const sub = await getSubscriber({ email: email.toString() })

  if (sub.code !== "success") {
    const newSub = await createSubscriber({
      email,
      name,
      url,
    })

    if (newSub.code === "email_already_exists") {
      throw new Error("Transaction error: email already exists")
    }

    if (newSub.code === "error") {
      throw new Error("Transaction error: unknown")
    }

    // TODO: creating a new sub gets the data immediately
    // We should just replace the cache data at that point
    clearKey(`subscriber:${email}`)

    return newSub
  }

  return sub
}
export async function resendConfirmationEmail({ email }: { email: string }) {
  const response = await fetchButtondown(
    `/v1/subscribers/${email}/send-reminder`,
    {
      method: "POST",
    },
  )

  if (response.ok) {
    return {
      code: "success" as const,
    }
  }

  return {
    code: "error" as const,
  }
}

// "creation_date": "2019-08-24T14:15:22Z",
// "publish_date": "2024-08-24T14:15:22Z",
// "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
// "body": "Lorem ipsum yadda yadda",
// "subject": "This is my first email on Buttondown!",
// "excluded_tags": [],
// "included_tags": [],
// "email_type": "public",
// "status": "sent",
// "metadata": {},
// "secondary_id": 3,
// "external_url": "https://buttondown.email/jmduke/my-first-email"
// }

const emailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  body: z.string(),
  description: z.string(),
  creation_date: z.string(),
  publish_date: z.string().nullable(),
  email_type: z.string(),
  status: z.string(),
  metadata: z.object({}),
  secondary_id: z.number(),
  external_url: z.string(),
})

const emailListSchema = z.object({
  count: z.number(),
  results: z.array(emailSchema),
})
export async function getButtondownEmails() {
  const response = await cachified({
    cache,
    key: `buttondown:emails`,
    ttl: 1000 * 60 * 60 * 12,
    swr: 1000 * 60 * 60 * 24,
    async getFreshValue() {
      return fetchButtondown(`/v1/emails?ordering=-creation_date`, {
        method: "GET",
      })
    },
  })

  if (response.ok) {
    return {
      code: "success" as const,
      data: emailListSchema.parse(response.data),
    }
  }

  return {
    code: "error" as const,
  }
}

export async function getEmail({ id }: { id: string }) {
  const response = await fetchButtondown(`/v1/emails/${id}`, {
    method: "GET",
  })

  if (response.ok) {
    return {
      code: "success" as const,
      data: emailSchema.parse(response.data),
    }
  }

  return {
    code: "error" as const,
  }
}

async function fetchButtondown(
  path: string,
  options: RequestInit,
): Promise<
  | {
      ok: true
      data: unknown
    }
  | {
      ok: false
      error: unknown
    }
> {
  const url = new URL(path, baseUrl)

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      ...options.headers,
    },
  })

  const text = await response.text()

  return response.ok
    ? {
        ok: true,
        data: text ? JSON.parse(text) : {},
      }
    : {
        ok: false,
        error: text ? JSON.parse(text) : {},
      }
}
