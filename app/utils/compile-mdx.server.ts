import { bundleMDX } from "mdx-bundler"
import type { GitHubFile } from "~/types"
import { getQueue } from "./p-queue.server"

async function compileMdxImpl<FrontmatterType extends Record<string, unknown>>({
  slug,
  files,
}: {
  slug: string
  files: Array<GitHubFile>
}) {
  // prettier-ignore
  const { default: remarkAutolinkHeader } = await import("remark-autolink-headings")
  const { default: remarkGfm } = await import("remark-gfm")
  const { default: remarkSlug } = await import("remark-slug")

  const { visit } = await import("unist-util-visit")

  const indexPattern = /index.mdx?$/
  const indexFile = files.find(({ path }) => path.match(indexPattern))
  if (!indexFile) {
    return null
  }

  const rootDir = indexFile.path.replace(indexPattern, "")
  const relativeFiles = files.map(({ path, content }) => ({
    path: path.replace(rootDir, "./"),
    content,
  }))

  const filesObject = arrayToObject(relativeFiles, {
    keyname: "path",
    valuename: "content",
  })

  const rehypeMetaAttribute = () => {
    return (tree) => {
      visit(tree, "element", visitor)
    }

    function visitor(node, index, parentNode) {
      let match

      if (node.tagName === "code" && node.data && node.data.meta) {
        re.lastIndex = 0 // Reset regex.

        while ((match = re.exec(node.data.meta))) {
          parentNode.properties[match[1]] =
            match[2] || match[3] || match[4] || ""
        }
      }
    }
  }

  try {
    const { code, frontmatter } = await bundleMDX({
      source: indexFile.content,
      files: filesObject,
      mdxOptions: (options) => ({
        remarkPlugins: [
          ...(options.remarkPlugins ?? []),
          remarkSlug,
          [remarkAutolinkHeader, { behavior: "wrap" }],
          remarkGfm,
        ],
        rehypePlugins: [
          ...(options.rehypePlugins ?? []),
          rehypeMetaAttribute,
          [
            require(`rehype-shiki`),
            {
              theme: `public/from-paris-with-love.json`,
              useBackground: true,
            },
          ],
        ],
      }),
    })

    return { code, frontmatter: frontmatter as FrontmatterType }
  } catch (e) {
    throw new Error(`MDX Compilation failed for ${slug}`)
  }
}

const re = /\b([-\w]+(?![^{]*}))(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g

function arrayToObject<Item extends Record<string, unknown>>(
  array: Array<Item>,
  { keyname, valuename }: { keyname: keyof Item; valuename: keyof Item },
) {
  const obj: Record<string, Item[keyof Item]> = {}

  for (const item of array) {
    const key = item[keyname]
    if (typeof key !== "string") {
      throw new Error(`Type of ${key} should be a string`)
    }
    const value = item[valuename]
    obj[key] = value
  }

  return obj
}

async function queuedCompileMdx<
  FrontmatterType extends Record<string, unknown>,
>(...params: Parameters<typeof compileMdxImpl>) {
  const queue = await getQueue()

  const result = await queue.add(() =>
    compileMdxImpl<FrontmatterType>(...params),
  )

  return result
}

export { queuedCompileMdx as compileMdx }
