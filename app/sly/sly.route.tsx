import { Outlet } from "@remix-run/react"
import { DiamondLightsOut } from "./Diamonds.tsx"
import styles from "./styles.css"

import type { LinksFunction } from "@remix-run/node"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

export default function Sly() {
  return (
    <div className="relative h-full bg-white">
      <div className="bg-diamond absolute inset-0" />

      <div className="relative grid grid-cols-[repeat(auto-fit,_100px)] justify-center">
        <DiamondLightsOut />
      </div>
      <div className="relative z-10 mt-4 grow">
        <Outlet />
      </div>
    </div>
  )
}
