// http://localhost:3000/cache?token=devtoken-ccccccvktlfkugfrbtvenbgjdfkkuverttiucfdftvdj
import {
  cache,
  getAllCacheKeys,
  lruCache,
  searchCacheKeys,
} from "#app/cache/cache.server.ts"
import { invariantResponse, requireRequestWithToken } from "#app/utils/misc.ts"
import { json, redirect, type DataFunctionArgs } from "@remix-run/node"
import {
  ensureInstance,
  getAllInstances,
  getInstanceInfo,
} from "./litefs.server.ts"
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { Button } from "#app/components/ui/button.tsx"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#app/components/ui/select.tsx"
import { Input } from "#app/components/ui/input.tsx"

export async function loader({ request }: DataFunctionArgs) {
  await requireRequestWithToken(request)

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
  await requireRequestWithToken(request)

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

export default function CacheAdminRoute() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("query") ?? ""
  const limit = searchParams.get("limit") ?? "100"
  const instance = searchParams.get("instance") ?? data.instance

  return (
    <div className="container">
      <div key="1" className="flex flex-col gap-6 p-6">
        <form className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <input
            type="hidden"
            name="token"
            value={searchParams.get("token") ?? ""}
          />
          <div className="flex-1">
            <Input
              className="w-full"
              placeholder="Search key..."
              type="search"
              onChange={(event) => {
                if (!event.currentTarget.value) {
                  setSearchParams((params) => {
                    params.delete("query")
                    return params
                  })
                }
              }}
              name="query"
              defaultValue={query}
            />
          </div>
          <div className="w-36">
            <Input
              className="w-full"
              placeholder="Items to return..."
              type="number"
              name="limit"
              defaultValue={limit}
            />
          </div>
          <div className="w-40">
            <Select defaultValue={instance}>
              <SelectTrigger>
                <SelectValue placeholder="Select a replica" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(data.instances).map(([inst, region]) => (
                    <SelectItem key={inst} value={inst}>
                      {[
                        inst,
                        `(${region})`,
                        inst === data.currentInstanceInfo.currentInstance
                          ? "(current)"
                          : "",
                        inst === data.currentInstanceInfo.primaryInstance
                          ? " (primary)"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gray-800 text-white" type="submit">
            Search
          </Button>
        </form>

        <h2 className="text-2xl font-bold">LRU cache</h2>
        <div className="divide-y divide-gray-200">
          {data.cacheKeys.lru.map((key) => (
            <CacheKeyRow
              key={key}
              cacheKey={key}
              instance={instance}
              type="lru"
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold">SQLite cache</h2>
        <div className="divide-y divide-gray-200">
          {data.cacheKeys.sqlite.map((key) => (
            <CacheKeyRow
              key={key}
              cacheKey={key}
              instance={instance}
              type="sqlite"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CacheKeyRow({
  cacheKey,
  instance,
  type,
}: {
  cacheKey: string
  instance?: string
  type: "sqlite" | "lru"
}) {
  const [searchParams] = useSearchParams()
  const fetcher = useFetcher<typeof action>()
  const encodedKey = encodeURIComponent(cacheKey)
  const valuePage = `/cache/${type}/${encodedKey}?instance=${instance}&token=${
    searchParams.get("token") ?? ""
  }`
  return (
    <div className="group flex items-center justify-between px-4 text-sm hover:bg-gray-100">
      <Link reloadDocument to={valuePage}>
        {cacheKey}
      </Link>

      <fetcher.Form method="post">
        <input type="hidden" name="cacheKey" value={cacheKey} />
        <input type="hidden" name="instance" value={instance} />
        <input type="hidden" name="type" value={type} />
        <Button
          className="bg-red-500 text-white opacity-0 group-hover:opacity-100"
          variant="destructive"
          type="submit"
        >
          {fetcher.state === "idle" ? "Delete" : "Deleting..."}
        </Button>
      </fetcher.Form>
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}
