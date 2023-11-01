import { getHighlighter } from "shiki"
import {
  renderCodeToHTML,
  runTwoSlash,
  createShikiHighlighter,
  renderers,
} from "shiki-twoslash"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const themeName = "base16"
/** @type {import("shiki").Highlighter} */
let highlighter

export default async function highlight({
  code,
  language,
  themeJson,
  addedLines,
  removedLines,
  highlightLines,
  numbers,
  startingLineNumber,
  shouldRunTwoslash,
}) {
  highlighter =
    highlighter || (await createShikiHighlighter({ themes: [themeJson] }))

  const fgColor = convertFakeHexToCustomProp(
    highlighter.getForegroundColor(themeJson.themeName) || "",
  )
  const bgColor = convertFakeHexToCustomProp(
    highlighter.getBackgroundColor(themeJson.themeName) || "",
  )

  // const html = renderCodeToHTML(
  //   shouldRunTwoslash ? twoslash.code : code,
  //   language,
  //   { twoslash: twoslash },
  //   {
  //     themeName: themeJson.themeName,
  //   },
  // )

  try {
    var tokens = highlighter.codeToThemedTokens(
      code,
      language,
      themeJson.themeName,
    )
  } catch (error) {
    return renderers.plainTextRenderer(code, {
      langId: language,
    })
  }

  const isDiff = addedLines.length > 0 || removedLines.length > 0
  let diffLineNumber = startingLineNumber - 1
  const children = tokens
    .slice(0, -1) // Remove blank line at end
    .map((lineTokens, zeroBasedLineNumber) => {
      const children = lineTokens.map((token) => {
        return {
          type: "element",
          tagName: "span",
          properties: {
            style: `color: ${token.color}; word-break: break-all;`,
          },
          children: [token.content],
        }
      })

      children.push({
        type: "text",
        value: "\n",
      })

      const lineNumber = zeroBasedLineNumber + startingLineNumber
      const highlightLine = highlightLines.includes(lineNumber)
      const removeLine = removedLines.includes(lineNumber)
      const addLine = addedLines.includes(lineNumber)
      if (!removeLine) {
        diffLineNumber++
      }

      return {
        type: "element",
        tagName: "span",
        properties: {
          className: "codeblock-line whitespace-pre-wrap",
          dataHighlight: highlightLine ? "true" : undefined,
          dataLineNumber: numbers ? lineNumber : undefined,
          dataAdd: isDiff ? addLine : undefined,
          dataRemove: isDiff ? removeLine : undefined,
          dataDiffLineNumber: isDiff ? diffLineNumber : undefined,
        },
        children,
      }
    })

  const twoslash = shouldRunTwoslash ? runTwoSlash(code, language, {}) : null

  if (shouldRunTwoslash) {
    return renderers.twoslashRenderer(
      tokens,
      {
        fg: fgColor,
        bg: bgColor,
        langId: language,
      },
      twoslash,
      { twoslash: shouldRunTwoslash },
    )
  }

  return renderers.defaultShikiRenderer(
    tokens,
    {
      fg: fgColor,
      bg: bgColor,
      langId: language,
    },
    {},
  )
}

// The theme actually stores #FFFF${base-16-color-id} because vscode-textmate
// requires colors to be valid hex codes, if they aren't, it changes them to a
// default, so this is a mega hack to trick it.
function convertFakeHexToCustomProp(color) {
  return color.replace(/^#FFFF(.+)/, "var(--base$1)")
}
