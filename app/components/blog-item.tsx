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
    <article className="">
      <Link
        prefetch="intent"
        to={`/content/${slug}`}
        className={`group flex overflow-hidden rounded-lg hover:bg-gray-100 ${
          img ? "" : "-ml-4"
        }`}
      >
        {img ? (
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-lg transition-all group-hover:rounded-none">
            <div
              style={{ backgroundImage: `url(/${img})` }}
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            />
          </div>
        ) : null}
        <div className={`flex flex-col gap-2 px-4 py-4`}>
          <ul className="mb-2 flex gap-x-4 text-xs font-bold uppercase tracking-wide text-gray-500">
            {tags.split(",").map((tag) => (
              <li key={tag}>{tag.trim()}</li>
            ))}
          </ul>
          <h2
            className="mb-4 text-xl font-bold text-gray-800"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h2>
        </div>
      </Link>
    </article>
  )
}
