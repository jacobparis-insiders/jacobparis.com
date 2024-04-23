import { bundleMDX } from "mdx-bundler"
import { getQueue } from "./p-queue.server.ts"

import chalk from "chalk"
import remarkAutolinkHeadings from "remark-autolink-headings"
import remarkGfm from "remark-gfm"
import remarkSlug from "remark-slug"
import { visit } from "unist-util-visit"
import fromParisWithLoveTheme from "#public/from-paris-with-love.json"
import { z } from "zod"
import { rehypeShikiWorker } from "#app/blog/mdx/rehype-shiki.ts"

async function compileMdxImpl({
  slug,
  content,
}: {
  slug: string
  content: string
}) {
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
      source: content,
      mdxOptions: (options) => ({
        remarkPlugins: [
          ...(options.remarkPlugins ?? []),
          remarkSlug,
          [remarkAutolinkHeadings, { behavior: "wrap" }],
          remarkGfm,
        ],
        rehypePlugins: [
          ...(options.rehypePlugins ?? []),
          rehypeMetaAttribute,
          [
            rehypeShikiWorker,
            {
              theme: fromParisWithLoveTheme,
            },
          ],
        ],
      }),
    })

    return {
      code,
      frontmatter,
    }
  } catch (e) {
    console.error(
      chalk.red(`MDX Compilation failed for /app/content/blog/${slug}`),
    )
  }

  return {
    code: null,
    frontmatter: {} as {
      [key: string]: any
    },
  }
}

const re = /\b([-\w]+(?![^{]*}))(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g
export const MdxSchema = z.object({
  code: z.string().optional(),
  frontmatter: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string().optional().nullable().default(null),
    tags: z.string().optional().nullable(),
    img: z.string().optional().nullable().default(null),
    timestamp: z.string().optional().nullable().default(null),
    published: z.boolean().optional().default(false),
    translations: z
      .array(
        z.object({
          lang: z.string(),
          href: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
  }),
})

async function queuedCompileMdx(
  params: Parameters<typeof compileMdxImpl>[0],
  { priority = 1 } = {},
) {
  const queue = await getQueue()

  const result = await queue.add(() => compileMdxImpl(params), {
    priority,
  })

  if (result.code === null) {
    return null
  }

  if (!result.frontmatter.title) {
    return null
  }

  return z
    .object({
      code: z.string(),
      frontmatter: MdxSchema.shape.frontmatter.extend({
        slug: z.string().optional(),
      }),
    })
    .parse(result)
}

export { queuedCompileMdx as compileMdx }
