import nodepath from "path"
import { Octokit as createOctokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"
import Lrucache from "lru-cache"
import type { GitHubFile } from "~/types.ts"
import { getRequiredEnvVar } from "./misc.ts"

import { z } from "zod"

type ThrottleOptions = {
  method: string
  url: string
  request: { retryCount: number }
}

const cache = new Lrucache({
  ttl: 1000 * 60,
  maxSize: 1024,
  sizeCalculation: (value) => Buffer.byteLength(JSON.stringify(value)),
})

const Octokit = createOctokit.plugin(throttling)

function getGHOwner() {
  return getRequiredEnvVar("GITHUB_REPOSITORY").split("/")[0]
}

function getGHRepository() {
  return getRequiredEnvVar("GITHUB_REPOSITORY").split("/")[1]
}

const octokit = new Octokit({
  auth: getRequiredEnvVar("GITHUB_TOKEN"),
  throttle: {
    onRateLimit: (retryAfter: number, options: ThrottleOptions) => {
      console.warn(
        `Request quota exhausted for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`,
      )

      return true
    },
    onAbuseLimit: (_: number, options: ThrottleOptions) => {
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`,
      )
    },
  },
})

function cachify<TArgs, TReturn>(fn: (args: TArgs) => Promise<TReturn>) {
  return async function (args: TArgs): Promise<TReturn> {
    if (cache.has(args)) {
      return cache.get(args) as TReturn
    }
    const result = await fn(args)
    cache.set(args, result)
    return result
  }
}
const GitHubFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  sha: z.string(),
  type: z.string(),
})

export async function downloadDirectoryList(path: string) {
  const response = await octokit.repos
    .getContent({
      owner: getGHOwner(),
      repo: getGHRepository(),
      path,
    })
    .catch((error) => {
      console.log("Error downloading directory list")
      console.log(error)
      return error
    })

  if (response.status === 401) {
    throw new Error("GitHub token is invalid")
  }

  return GitHubFileSchema.array().parse(response.data)
}

export async function downloadFileBySha(sha: string) {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
    {
      owner: getGHOwner(),
      repo: getGHRepository(),
      file_sha: sha,
    },
  )

  const encoding = data.encoding as Parameters<typeof Buffer.from>["1"]
  return Buffer.from(data.content, encoding).toString()
}

async function downloadFirstMdxFileImpl(
  list: Array<{ name: string; sha: string; type: string }>,
) {
  const filesOnly = list.filter(({ type }) => type === "file")

  for (const extension of [".mdx", ".md"]) {
    const file = filesOnly.find(({ name }) => name.endsWith(extension))
    if (file) {
      return downloadFileBySha(file.sha)
    }
  }

  return null
}

const downloadFirstMdxFile = cachify(downloadFirstMdxFileImpl)

async function downloadDirectoryImpl(path: string): Promise<Array<GitHubFile>> {
  const fileOrDirectoryList = await downloadDirectoryList(path)

  const results: Array<GitHubFile> = []

  for (const fileOrDirectory of fileOrDirectoryList) {
    switch (fileOrDirectory.type) {
      case "file": {
        const content = await downloadFileBySha(fileOrDirectory.sha)
        results.push({ path: fileOrDirectory.path, content })
        break
      }
      case "dir": {
        const fileList = await downloadDirectoryImpl(fileOrDirectory.path)
        results.push(...fileList)
        break
      }
      default:
        throw new Error(
          `Unknown file type returned for the file ${fileOrDirectory.path}`,
        )
    }
  }

  return results
}

export const downloadDirectory = cachify(downloadDirectoryImpl)

export async function downloadMdxOrDirectory(relativePath: string) {
  const path = `content/${relativePath}`
  const directory = nodepath.dirname(path)
  const basename = nodepath.basename(path)
  const nameWithoutExt = nodepath.parse(path).name

  const directoryList = await downloadDirectoryList(directory)

  const potentials = directoryList.filter(({ name }) =>
    name.startsWith(basename),
  )
  const potentialDirectory = potentials.find(({ type }) => type === "dir")
  const exactMatch = potentials.find(
    ({ name }) => nodepath.parse(name).name === nameWithoutExt,
  )

  const content = await downloadFirstMdxFile(
    exactMatch ? [exactMatch] : potentials,
  )

  let entry = path
  let files: Array<GitHubFile> = []

  if (content) {
    entry = path.endsWith(".mdx") || path.endsWith(".md") ? path : `${path}.mdx`
    files = [{ path: nodepath.join(path, "index.mdx"), content }]
  } else if (potentialDirectory) {
    entry = potentialDirectory.path
    files = await downloadDirectory(path)
  }

  return { entry, files }
}
