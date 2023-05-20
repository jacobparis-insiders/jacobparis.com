import { Link } from "@remix-run/react"
import type { getMdxListItems } from "~/utils/mdx.server"

type BlogItemType = Awaited<ReturnType<typeof getMdxListItems>>[0]

export default function BlogItem({
  slug,
  title,
  tags = "",
  img = "",
}: Pick<BlogItemType, "slug" | "title"> & {
  img?: string
  tags?: string
}) {
  return (
    <article className="sm:col-span-2">
      <Link
        prefetch="intent"
        to={`/content/${slug}`}
        className="group relative flex h-96 w-full flex-col justify-end gap-2 overflow-hidden rounded-lg bg-gray-800/5  text-white transition-colors"
      >
        <div
          style={{ backgroundImage: `url(${img})` }}
          className="absolute inset-0 -z-10 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-[1.05]"
        />
        <div className="bg-black/30 px-8 pb-6 pt-4">
          <ul className="mb-2 flex gap-x-4 text-xs font-bold uppercase tracking-wide text-white">
            {tags.split(",").map((tag) => (
              <li key={tag}>{tag.trim()}</li>
            ))}
          </ul>
          <h3
            className="text-4xl font-bold text-white "
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h3>
        </div>
      </Link>
    </article>
  )
}
