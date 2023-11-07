import { Link } from "@remix-run/react"

export default function BlogCard({
  slug,
  title,
  img = "",
  tags = "",
  className = "",
}: {
  slug: string
  title: string
  img?: string
  tags?: string
  className?: string
}) {
  return (
    <article className={className}>
      <Link
        prefetch="intent"
        to={`/content/${slug}`}
        className={`group flex h-full  flex-col gap-2 overflow-hidden rounded-lg ${
          img
            ? "bg-white"
            : "transition-colors duration-300 ease-out hover:bg-white"
        }`}
      >
        {img ? (
          <div className="relative z-10 h-48 overflow-hidden">
            <div
              style={{ backgroundImage: `url(${img})` }}
              className="absolute inset-0 -z-10 bg-cover  bg-center transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            />
          </div>
        ) : null}
        <div className="px-6 py-4">
          <ul className="mb-2 flex gap-x-4 text-xs font-bold uppercase tracking-wide text-gray-500">
            {tags.split(",").map((tag) => (
              <li key={tag}>{tag.trim()}</li>
            ))}
          </ul>
          <h3
            className="mb-4 text-xl font-bold text-gray-800 transition-colors duration-300 ease-out group-hover:text-black"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h3>
        </div>
      </Link>
    </article>
  )
}
