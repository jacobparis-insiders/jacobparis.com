import { initSeo } from "remix-seo"

export const { getSeo, getSeoLinks, getSeoMeta } = initSeo({
  title: "Jacob Paris",
  description: "The central source of Jacob Paris on the internet",
  twitter: {
    card: "summary",
    creator: "@jacobmparis",
    site: "https://jacobparis.com",
    title: "Jacob Paris",
    description: "The central source of Jacob Paris on the internet",
  },
})
