import type { getMdxListItems } from "~/utils/mdx.server"
import BlogItem from "./blog-item"

type BlogListType = {
  blogList: Awaited<ReturnType<typeof getMdxListItems>>
}

export default function BlogList({ blogList }: BlogListType) {
  return (
    <ol className="grid gap-x-8 md:grid-cols-2">
      {blogList.map((blogItem) => (
        <BlogItem key={blogItem.slug} {...blogItem} />
      ))}
    </ol>
  )
}
