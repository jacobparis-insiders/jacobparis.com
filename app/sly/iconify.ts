import { z } from "zod"

const IconifyInfoSchema = z.object({
  name: z.string(),
  total: z.number(),
  author: z.object({
    name: z.string(),
    url: z.string().optional(),
  }),
  license: z.object({
    title: z.string(),
    spdx: z.string(),
    url: z.string().optional(),
  }),
  samples: z.array(z.string()),
  height: z.number().optional(),
  category: z.string().optional(),
  palette: z.boolean(),
})

const IconifyCollectionsSchema = z.record(z.string(), IconifyInfoSchema)

export async function getIconifyIndex() {
  const index = await fetch("https://api.iconify.design/collections").then(
    (res) => res.json(),
  )

  return IconifyCollectionsSchema.parse(index)
}
