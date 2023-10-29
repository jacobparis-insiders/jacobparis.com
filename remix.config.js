import path from "path"
import { routeExtensions } from "remix-custom-routes"

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  tailwind: true,
  postcss: true,
  cacheDirectory: "./node_modules/.cache/remix",
  browserNodeBuiltinsPolyfill: {
    modules: {
      crypto: true,
    },
  },
  async routes() {
    const appDirectory = path.join(process.cwd(), "app")

    return routeExtensions(appDirectory)
  },
}
