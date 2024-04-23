import { Feed } from "feed"
import { getContentListData, getBlogList } from "./get-content-list.ts"
import { getButtondownEmails } from "../moulton/buttondown.server.ts"

const baseUrl = "https://www.jacobparis.com"

export async function loader() {
  const whenContent = getContentListData()
  const whenMoulton = getButtondownEmails()

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

  const blogList = getBlogList(await whenContent)
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

  const moulton = await whenMoulton
  if (moulton.code === "success") {
    for (const page of moulton.data.results) {
      feed.addItem({
        link: `${baseUrl}/content/moulton-${page.id}`,
        title: page.subject,
        description: page.description,
        date: new Date(page.creation_date),
      })
    }
  }

  const rss = feed.rss2()

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rss)),
    },
  })
}
