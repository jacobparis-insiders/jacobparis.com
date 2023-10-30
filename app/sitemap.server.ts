import type { EntryContext } from "@remix-run/node"
import {
  getDomainUrl,
  removeTrailingSlash,
  typedBoolean,
} from "./utils/misc.ts"

export type SitemapEntry = {
  route: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export async function getSitemapXml(request: Request, context: EntryContext) {
  const domainUrl = getDomainUrl(request)

  function getEntry({ route, lastmod, changefreq, priority }: SitemapEntry) {
    return `
      <url>
        <loc>${domainUrl}/${route}</loc>
        ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
        ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
        ${priority ? `<priority>${priority}</priority>` : ""}
      </url>
    `.trim()
  }
  const rawSitemapEntries = (
    await Promise.all(
      Object.entries(context.routeModules).map(async ([id, mod]) => {
        if (id === "root") return
        if (id.startsWith("cache")) return

        const handle = mod.handle
        if (handle && typeof handle === "object") {
          if (
            "getSitemapEntries" in handle &&
            typeof handle.getSitemapEntries === "function"
          ) {
            return handle.getSitemapEntries(request)
          }
        }

        // exclude resource routes from the sitemap
        // (these are an opt-in via the getSitemapEntries method)
        if (!("default" in mod)) return

        const manifestEntry = context.manifest.routes[id]
        if (!manifestEntry) {
          console.warn(`Could not find a manifest entry for ${id}`)
          return
        }

        let path
        if (manifestEntry.path) {
          path = removeTrailingSlash(manifestEntry.path)
        } else if (manifestEntry.index) {
          path = ""
        } else {
          return
        }

        // we can't handle dynamic routes, so if the handle doesn't have a
        // getSitemapEntries function, we just
        if (path.includes(":")) return
        if (id === "root") return
        if (path === "*") return

        // This is a bug in the route convention that we need to fix
        // These are children of content.remix-multi-step-forms.example.route.tsx
        if (["complete", "email", "name"].includes(path)) return

        return { route: removeTrailingSlash(path) } as SitemapEntry
      }),
    )
  )
    .flatMap((z) => z)
    .filter(typedBoolean)

  const sitemapEntries: Array<SitemapEntry> = []
  for (const entry of rawSitemapEntries) {
    const existingEntryForRoute = sitemapEntries.find(
      (e) => e.route === entry.route,
    )
    if (existingEntryForRoute) {
      console.log({ existingEntryForRoute, entry })
      if (existingEntryForRoute !== entry) {
        console.warn(
          `Duplicate route for ${entry.route} with different sitemap data`,
          { entry, existingEntryForRoute },
        )
      }
    } else {
      sitemapEntries.push(entry)
    }
  }

  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      ${sitemapEntries.map((entry) => getEntry(entry)).join("")}
    </urlset>
  `.trim()
}
