import path from "path"

import type { RequestHandler } from "@remix-run/express"
import { createRequestHandler } from "@remix-run/express"
import type { ServerBuild } from "@remix-run/node"
import { broadcastDevReady, installGlobals } from "@remix-run/node"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import getPort, { portNumbers } from "get-port"
import chalk from "chalk"
import { ip as ipAddress } from "address"
import closeWithGrace from "close-with-grace"
import { fileURLToPath } from "url"

installGlobals()

const BUILD_PATH = "./build/index.js"
const WATCH_PATH = "./build/version.txt"

/**
 * Initial build
 * @type {ServerBuild}
 */
const build = await import(BUILD_PATH)
let devBuild = build

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(
  express.static("public", {
    maxAge: "1h",
    redirect: false,
  }),
)

app.use(morgan("tiny"))

function getRequestHandler(build: ServerBuild): RequestHandler {
  return createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
}

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (...args) => getRequestHandler(devBuild)(...args)
    : getRequestHandler(build),
)

const desiredPort = Number(process.env.PORT || 3000)
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
})
const server = app.listen(portToUse, () => {
  const addy = server.address()
  const portUsed =
    desiredPort === portToUse
      ? desiredPort
      : addy && typeof addy === "object"
      ? addy.port
      : 0

  if (portUsed !== desiredPort) {
    console.warn(
      chalk.yellow(
        `⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
      ),
    )
  }
  console.log(`🚀  We have liftoff!`)
  const localUrl = `http://localhost:${portUsed}`
  let lanUrl: string | null = null
  const localIp = ipAddress() ?? "Unknown"
  // Check if the address is a private ip
  // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
  // https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
  if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
    lanUrl = `http://${localIp}:${portUsed}`
  }

  console.log(
    `
${chalk.bold("Local:")}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold("On Your Network:")}  ${chalk.cyan(lanUrl)}` : ""}
${chalk.bold("Press Ctrl+C to stop")}
		`.trim(),
  )

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build)
  }
})

closeWithGrace(async ({ err }) => {
  if (err) {
    console.error(chalk.red(err?.message))
  }

  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve("ok")))
  })
})

// during dev, we'll keep the build module up to date with the changes
if (process.env.NODE_ENV === "development") {
  async function reloadBuild() {
    devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`)
    broadcastDevReady(devBuild)
  }

  // We'll import chokidar here so doesn't get bundled in production.
  const chokidar = await import("chokidar")

  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const watchPath = path.join(dirname, WATCH_PATH).replace(/\\/g, "/")

  const buildWatcher = chokidar
    .watch(watchPath, { ignoreInitial: true })
    .on("add", reloadBuild)
    .on("change", reloadBuild)

  closeWithGrace(() => buildWatcher.close())
}
