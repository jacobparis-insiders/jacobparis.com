export function getMeta(frontmatter: {
  title: string
  description: string
  slug: string
}) {
  const titleElements = frontmatter.title
    ? [
        { title: frontmatter.title },
        { name: "twitter:title", content: frontmatter.title },
        { property: "og:title", content: frontmatter.title },
      ]
    : []

  const descriptionElements = frontmatter.description
    ? [
        { name: "description", content: frontmatter.description },
        { name: "twitter:description", content: frontmatter.description },
        { property: "og:description", content: frontmatter.description },
      ]
    : []

  const imageElements = [
    {
      name: "twitter:image",
      content: `https://www.jacobparis.com/ui/${frontmatter.slug}.png`,
    },
    {
      property: "og:image",
      content: `https://www.jacobparis.com/ui/${frontmatter.slug}.png`,
    },
    { name: "twitter:card", content: "summary_large_image" },
  ]

  return [
    ...titleElements,
    ...descriptionElements,
    ...imageElements,
    { name: "twitter:site", content: "@jacobmparis" },
    { name: "twitter:creator", content: "@jacobmparis" },
    {
      property: "og:url",
      content: `https://www.jacobparis.com/ui/${frontmatter.slug}`,
    },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Jacob Paris" },
    { property: "og:locale", content: "en_US" },
  ]
}
