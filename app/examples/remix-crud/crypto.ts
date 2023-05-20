import crypto from "crypto"

export function randomUuid() {
  if (typeof window !== "undefined") {
    return window.crypto.randomUUID()
  }

  return crypto.randomUUID()
}
