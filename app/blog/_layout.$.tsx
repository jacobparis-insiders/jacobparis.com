import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { ButtonLink } from "~/components/ButtonLink"

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    {
      title: "Not found | Jacob Paris",
    },
  ]
}
