import invariant from "tiny-invariant";
import { cachified, cache } from "#app/cache/cache.server.ts";
import { compileMdx } from "#app/utils/compile-mdx.server.ts";
import { downloadFileBySha } from "#app/utils/github.server.ts";
import { getContentList } from "./content.server.ts";


export async function getContentListData() {
  const contentList = await getContentList();

  return Promise.all(
    contentList.map(async (content) => {
      const slug = content.name.replace(".mdx", "");

      const compiledMdx = await cachified({
        key: `mdx:${slug}`,
        cache,
        // add random jitter to avoid thundering herd
        ttl: 1000 * 60 * 60 * 6 + Math.random() * 1000 * 60 * 60 * 2,
        async getFreshValue({ background }) {
          const file = await downloadFileBySha(content.sha);

          return compileMdx(
            {
              slug: slug,
              content: file,
            },
            {
              priority: background ? 0 : 1,
            }
          ).then((compiled) => {
            if (!compiled) {
              return null;
            }

            compiled.frontmatter.slug = slug;
            return compiled;
          });
        },
      }).catch((error) => {
        console.error("caught", error);
        return null;
      });

      return compiledMdx
        ? {
          frontmatter: compiledMdx.frontmatter,
        }
        : null;
    })
  ).then((content) => content.filter((c) => c !== null));
}

export function getBlogList(
  content: Awaited<ReturnType<typeof getContentListData>>
) {
  return content
    .filter((c) => c?.frontmatter.published)
    .map((c) => {
      invariant(c);
      return c.frontmatter;
    })
    .sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;

      const aDate = new Date(a.timestamp);
      const bDate = new Date(b.timestamp);

      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;

      return 0;
    })
    .map((blog) => ({
      ...blog,
      slug: blog.slug as string,
      timestamp: blog.timestamp
        ? new Date(blog.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        : null,
    }));
}
