const path = require("path")
const { routeExtensions } = require("remix-custom-routes")
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
  },

  cacheDirectory: "./node_modules/.cache/remix",
  async routes() {
    const appDirectory = path.join(__dirname, "app")

    return routeExtensions(appDirectory)
  },
}
