import { Feed } from "feed"
import {
  getContentListData,
  getBlogList,
} from "./_layout.content._index.route.tsx"

const baseUrl = "https://www.jacobparis.com"

export async function loader() {
  const content = await getContentListData()
  const blogList = getBlogList(content)

  const feed = new Feed({
    id: baseUrl,
    link: `${baseUrl}/content`,
    title: "Jacob Paris",
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}, Jacob Paris`,
    description:
      "Come check out my guides to make you better at building web applications.",
    author: {
      name: "Jacob Paris",
      link: "https://twitter.com/jacobmparis",
    },
  })

  for (const blog of blogList) {
    const { slug, title, description, timestamp, tags } = blog

    if (!timestamp) continue

    feed.addItem({
      link: `${baseUrl}/content/${slug}`,
      title: title,
      description: description ? description : "",
      date: new Date(timestamp),
      category: tags
        ?.split(",")
        .map((t) => t.trim())
        .map((item) => ({
          name: item,
        })),
    })
  }

  const rss = feed.rss2()

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rss)),
    },
  })
}
