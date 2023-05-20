import crypto from "crypto"

export function randomUuid() {
  let uuid: string
  if (typeof window !== "undefined") {
    uuid = window.crypto.randomUUID()
  } else {
    uuid = crypto.randomUUID()
  }

  return uuid.split("-")[0]
}

export const importKey = crypto.subtle.importKey
export const sign = crypto.subtle.sign
