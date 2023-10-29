import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let redirects: Array<any> = []

declare global {
  var __redirects: typeof redirects
}

if (!global.__redirects || process.env.NODE_ENV === "development") {
  const redirectsFile = path.join(__dirname, "_redirects")
  const redirectsFileContents = fs.readFileSync(redirectsFile, "utf8")
  const entries = redirectsFileContents
    .split("\n")
    .map(normalizeLine)
    .filter(hasRedirect)
    .map((redirectLine) => parseRedirect(redirectLine))

  const splitRedirects = splitResults(entries)
  if (splitRedirects.errors.length > 0) {
    throw new Error(splitRedirects.errors.join("\n"))
  }

  global.__redirects = splitRedirects.redirects

  redirects = global.__redirects
}

export default redirects

function normalizeLine(line, index) {
  return { line: line.trim(), index }
}

function hasRedirect({ line }) {
  if (!line) return false
  if (line.startsWith("#")) return false

  return true
}

function parseRedirect({ line, index }) {
  try {
    return parseRedirectLine(line)
  } catch (error) {
    if (error instanceof Error) {
      return new Error(`Could not parse redirect line ${index + 1}:
    ${line}
  ${error.message}`)
    }
  }
}

function parseRedirectLine(line) {
  const [from, ...parts] = trimComment(line.split(/\s+/g))

  if (parts.length === 0) {
    throw new Error("Missing destination path/URL")
  }

  const {
    queryParts,
    to,
    lastParts: [statusPart, ...conditionsParts],
  } = parseParts(parts)

  const query = parsePairs(queryParts)
  const { status, force } = parseStatus(statusPart)
  const { Sign, signed = Sign, ...conditions } = parsePairs(conditionsParts)
  return { from, query, to, status, force, conditions, signed }
}

function parseParts(parts) {
  if (Number.isInteger(parseInt(parts[0], 10))) {
    return { queryParts: [], to: undefined, lastParts: parts }
  }

  const toIndex = parts.findIndex((part) => {
    return part.startsWith("/") || isUrl(part)
  })
  if (toIndex === -1) {
    throw new Error(
      'The destination path/URL must start with "/", "http:" or "https:"',
    )
  }

  const queryParts = parts.slice(0, toIndex)
  const to = parts[toIndex]
  const lastParts = parts.slice(toIndex + 1)
  return { queryParts, to, lastParts }
}

function trimComment(line) {
  const commentIndex = line.indexOf("#")
  if (commentIndex === -1) return line

  return line.slice(0, commentIndex)
}

function isUrl(pathOrUrl) {
  const SCHEMES = ["http://", "https://"]

  return SCHEMES.some((scheme) => pathOrUrl.startsWith(scheme))
}

function parsePairs(conditions) {
  return Object.assign({}, ...conditions.map(parsePair))
}

function parsePair(condition) {
  const [key, value] = condition.split("=")
  return { [key]: value }
}

function parseStatus(statusPart) {
  if (statusPart === undefined) {
    return {}
  }

  const status = parseInt(statusPart, 10)

  if (!Number.isInteger(status)) {
    return { status: statusPart, force: false }
  }

  const force = statusPart.endsWith("!")
  return { status, force }
}

function splitResults(results) {
  const redirects = results.filter((result) => !(result instanceof Error))
  const errors = results.filter((result) => result instanceof Error)
  return { redirects, errors }
}
