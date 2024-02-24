import { writeFileSync } from "fs"
import path from "path"
import { cleanUrl } from "./cleanUrl"

export function saveNote(url: string, content: string) {
  const id = cleanUrl(url)
  const pathname = path.resolve("public", "resources", `${id}.txt`)
  writeFileSync(pathname, content)
}
