import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import crypto from "node:crypto"
import { getRequiredEnvVar } from "~/utils/misc.ts"
import { z } from "zod"

const CloudflareResponseSchema = z
  .object({
    success: z.literal(true),
    result: z.object({
      uploadURL: z.string(),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      errors: z.array(
        z.object({
          code: z.number(),
          message: z.string(),
        }),
      ),
    }),
  )
/**
 * Return a signed URL for Cloudflare Images.
 */
export async function action({ request }: ActionFunctionArgs) {
  const accountId = getRequiredEnvVar("CLOUDFLARE_IMAGES_ACCOUNT_ID")
  const apiToken = getRequiredEnvVar("CLOUDFLARE_IMAGES_API_TOKEN")

  const formData = await request.formData()
  const metaString = formData.get("meta")?.toString()

  const body = new FormData()
  body.append("requireSignedURLs", "true")
  if (metaString) {
    body.append("metadata", metaString)
  }

  const response = await CloudflareResponseSchema.parseAsync(
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body,
      },
    ).then((response) => response.json()),
  )

  if (!response.success) {
    console.error(response.errors.map((error) => error.message).join("\n"))
    throw new Error("Cloudflare Images API returned an error.")
  }

  return json({
    uploadUrl: response.result.uploadURL as string,
  })
}

async function getUploadUrl(meta: { name: string }) {
  const body = new FormData()
  body.append("meta", JSON.stringify(meta))

  const { uploadUrl } = await fetch(
    `/content/remix-image-uploads/example/cloudflare-images`,
    {
      method: "POST",
      body,
    },
  ).then((response) => response.json())

  return uploadUrl as string
}

export async function uploadImages(files: File[]) {
  return Promise.all(files.map((file) => uploadImage(file)))
}

export async function uploadImage(file: File) {
  const uploadUrl = await getUploadUrl({
    name: file.name,
  })

  const body = new FormData()
  body.append("file", file)
  return fetch(uploadUrl, {
    method: "POST",
    body,
  })
    .then((response) => response.text())
    .then((text) => {
      if (text.includes("ERROR 5443:")) {
        // gif too long, frames cannot exceed 100 million pixels
        throw new Error(
          "GIF too long, frames cannot exceed 100 million pixels.",
        )
      }

      if (text.includes("ERROR 5455:")) {
        // ERROR 5455: Uploaded image must have image/jpeg, image/png, image/webp, image/gif or image/svg+xml content-type
        throw new Error("Image must be jpeg, png, webp, gif, or svg.")
      }

      if (!text.startsWith("{")) {
        throw new Error(text)
      }

      return JSON.parse(text)
    })
    .then((response) => {
      return {
        name: response.result.meta.name as string,
        url: response.result.variants[0] as string,
      }
    })
}

/**
 * Takes an unsigned imagedelivery.net URL and returns a signed one.
 *
 * @tutorial https://developers.cloudflare.com/images/cloudflare-images/serve-images/serve-private-images-using-signed-url-tokens/
 */
export async function generateSignedUrl(urlString: string) {
  const KEY = getRequiredEnvVar("CLOUDFLARE_IMAGES_SIGNING_KEY")
  const EXPIRATION = 60 * 60 * 24 // 1 day
  // `url` is a full imagedelivery.net URL
  // e.g. https://imagedelivery.net/cheeW4oKsx5ljh8e8BoL2A/bc27a117-9509-446b-8c69-c81bfeac0a01/mobile

  const encoder = new TextEncoder()
  const secretKeyData = encoder.encode(KEY)
  const key = await crypto.webcrypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const url = new URL(urlString)
  // Attach the expiration value to the `url`
  const expiry = Math.floor(Date.now() / 1000) + EXPIRATION
  url.searchParams.set("exp", String(expiry))
  // `url` now looks like
  // https://imagedelivery.net/cheeW4oKsx5ljh8e8BoL2A/bc27a117-9509-446b-8c69-c81bfeac0a01/mobile?exp=1631289275

  const stringToSign = url.pathname + "?" + url.searchParams.toString()
  // for example, /cheeW4oKsx5ljh8e8BoL2A/bc27a117-9509-446b-8c69-c81bfeac0a01/mobile?exp=1631289275

  // Generate the signature
  const mac = await crypto.webcrypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(stringToSign),
  )
  const sig = bufferToHex(new Uint8Array(mac).buffer)

  // And attach it to the `url`
  url.searchParams.set("sig", sig)

  return url.toString()
}

function bufferToHex(buffer: ArrayBufferLike) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
}
