import {
  cache,
  getAllCacheKeys,
  lruCache,
  searchCacheKeys,
} from "#app/cache/cache.server.ts"
import { invariantResponse } from "#app/utils/misc.ts"
import { json, redirect, type DataFunctionArgs } from "@remix-run/node"
import {
  ensureInstance,
  getAllInstances,
  getInstanceInfo,
} from "./litefs.server.ts"

export async function loader({ request }: DataFunctionArgs) {
  // await requireUserWithRole(request, 'admin')
  const searchParams = new URL(request.url).searchParams
  const query = searchParams.get("query")
  if (query === "") {
    searchParams.delete("query")
    return redirect(`/cache?${searchParams.toString()}`)
  }
  const limit = Number(searchParams.get("limit") ?? 100)

  const currentInstanceInfo = await getInstanceInfo()
  const instance =
    searchParams.get("instance") ?? currentInstanceInfo.currentInstance
  const instances = await getAllInstances()
  await ensureInstance(instance)

  let cacheKeys: { sqlite: Array<string>; lru: Array<string> }
  if (typeof query === "string") {
    cacheKeys = await searchCacheKeys(query, limit)
  } else {
    cacheKeys = await getAllCacheKeys(limit)
  }
  return json({ cacheKeys, instance, instances, currentInstanceInfo })
}

export async function action({ request }: DataFunctionArgs) {
  // await requireUserWithRole(request, 'admin')
  const formData = await request.formData()
  const key = formData.get("cacheKey")
  const { currentInstance } = await getInstanceInfo()
  const instance = formData.get("instance") ?? currentInstance
  const type = formData.get("type")

  invariantResponse(typeof key === "string", "cacheKey must be a string")
  invariantResponse(typeof type === "string", "type must be a string")
  invariantResponse(typeof instance === "string", "instance must be a string")
  await ensureInstance(instance)

  switch (type) {
    case "sqlite": {
      await cache.delete(key)
      break
    }
    case "lru": {
      lruCache.delete(key)
      break
    }
    default: {
      throw new Error(`Unknown cache type: ${type}`)
    }
  }
  return json({ success: true })
}
