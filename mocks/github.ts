import nodepath from "path"
import fs from "fs-extra"
import type { HttpHandler } from "msw"
import { HttpResponse, http } from "msw"

async function isDirectory(d: string) {
  try {
    return (await fs.lstat(d)).isDirectory()
  } catch {
    return false
  }
}
async function isFile(d: string) {
  try {
    return (await fs.lstat(d)).isFile()
  } catch {
    return false
  }
}

type GHContentsDescription = {
  name: string
  path: string
  sha: string
  type: "dir" | "file"
}
/** This is an MSW v1 file and we are upgrading it to v2 */

export const GitHubMocks: Array<HttpHandler> = [
  http.get(
    "https://api.github.com/repos/:owner/:repo/contents/:path",
    async (info) => {
      const { repo, owner } = info.params

      if (typeof info.params.path !== "string") {
        throw new Error("Path should be a string")
      }
      const path = decodeURIComponent(info.params.path).trim()

      if (`${owner}/${repo}` !== process.env.GITHUB_REPOSITORY) {
        throw new Error(
          `Trying to fetch resource for unmockable resource: ${owner}/${repo}/${path}`,
        )
      }

      const localPath = nodepath.resolve(process.cwd(), path)
      const isLocalDir = await isDirectory(localPath)
      const isLocalFile = await isFile(localPath)

      if (!isLocalDir && !isLocalFile) {
        return HttpResponse.json([])
      }

      if (isLocalFile) {
        const file = fs.readFileSync(localPath, { encoding: "utf-8" })
        const encoding = "base64"

        return HttpResponse.json({
          content: Buffer.from(file, "utf-8").toString(encoding),
          encoding,
        })
      }

      const dirList = await fs.readdir(localPath)

      const dirContent = await Promise.all(
        dirList.map(async (name): Promise<GHContentsDescription> => {
          const relativePath = nodepath.join(path, name)
          const sha = relativePath
          const fullPath = nodepath.resolve(process.cwd(), relativePath)
          const isDir = await isDirectory(fullPath)

          return {
            name,
            path: relativePath,
            sha,
            type: isDir ? "dir" : "file",
          }
        }),
      )

      return HttpResponse.json(dirContent)
    },
  ),
  http.get(
    "https://api.github.com/repos/:owner/:repo/git/blobs/:sha",
    async (info) => {
      const { repo, owner } = info.params

      if (typeof info.params.sha !== "string") {
        throw new Error("sha should be a string")
      }
      const sha = decodeURIComponent(info.params.sha).trim()

      if (`${owner}/${repo}` !== process.env.GITHUB_REPOSITORY) {
        throw new Error(
          `Trying to fetch resource for unmockable resource: ${owner}/${repo}`,
        )
      }

      if (!sha.includes("/")) {
        throw new Error(`No mockable data found for the given sha: ${sha}`)
      }

      const fullPath = nodepath.resolve(process.cwd(), sha)
      const content = fs.readFileSync(fullPath, { encoding: "utf-8" })
      const encoding = "base64"

      return HttpResponse.json({
        sha,
        content: Buffer.from(content, "utf-8").toString(encoding),
        encoding,
      })
    },
  ),
  http.get(
    "https://api.github.com/repos/:owner/:repo/contents/:path*",
    async (info) => {
      const { owner, repo } = info.params

      if (typeof info.params.path !== "string") {
        throw new Error("Path should be a string")
      }
      const path = decodeURIComponent(info.params.path).trim()

      if (
        owner !== process.env.GH_OWNER ||
        repo !== process.env.GH_REPO ||
        !path.startsWith("content")
      ) {
        throw new Error(
          `Trying to fetch resource for unmockable resource: ${owner}/${repo}/${path}`,
        )
      }

      const fullPath = nodepath.resolve(process.cwd(), path)
      const content = fs.readFileSync(fullPath, { encoding: "utf-8" })
      const encoding = "base64"

      return HttpResponse.json({
        sha: path,
        content: Buffer.from(content, "utf-8").toString(encoding),
        encoding,
      })
    },
  ),
]
