/*!
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
/*!
 * Forked from @ryanflorence/md
 */
import type * as H from "hast"
import rangeParser from "parse-numeric-range"
import path from "path"
import type { Tinypool } from "tinypool"
import { fromHtml } from "hast-util-from-html"
import { fileURLToPath } from "url"
import type { Highlighter, Lang } from "shiki"
import { getHighlighter } from "shiki"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string")

let tokenizePool: Tinypool
let highlighter: Highlighter

function isLangString(value: string): value is Lang {
  return [
    "abap",
    "actionscript-3",
    "ada",
    "apache",
    "apex",
    "apl",
    "applescript",
    "asm",
    "astro",
    "awk",
    "ballerina",
    "bat",
    "batch",
    "berry",
    "be",
    "bibtex",
    "bicep",
    "blade",
    "c",
    "cadence",
    "cdc",
    "clarity",
    "clojure",
    "clj",
    "cmake",
    "cobol",
    "codeql",
    "ql",
    "coffee",
    "cpp",
    "crystal",
    "csharp",
    "c#",
    "css",
    "cue",
    "d",
    "dart",
    "diff",
    "docker",
    "dream-maker",
    "elixir",
    "elm",
    "erb",
    "erlang",
    "fish",
    "fsharp",
    "f#",
    "gherkin",
    "git-commit",
    "git-rebase",
    "glsl",
    "gnuplot",
    "go",
    "graphql",
    "groovy",
    "hack",
    "haml",
    "handlebars",
    "hbs",
    "haskell",
    "hcl",
    "hlsl",
    "html",
    "ini",
    "java",
    "javascript",
    "js",
    "jinja-html",
    "json",
    "jsonc",
    "jsonnet",
    "jssm",
    "fsl",
    "jsx",
    "julia",
    "kotlin",
    "latex",
    "less",
    "liquid",
    "lisp",
    "logo",
    "lua",
    "make",
    "makefile",
    "markdown",
    "md",
    "marko",
    "matlab",
    "mdx",
    "mermaid",
    "nginx",
    "nim",
    "nix",
    "objective-c",
    "objc",
    "objective-cpp",
    "ocaml",
    "pascal",
    "perl",
    "php",
    "plsql",
    "postcss",
    "powershell",
    "ps",
    "ps1",
    "prisma",
    "prolog",
    "pug",
    "jade",
    "puppet",
    "purescript",
    "python",
    "py",
    "r",
    "raku",
    "perl6",
    "razor",
    "rel",
    "riscv",
    "rst",
    "ruby",
    "rb",
    "rust",
    "rs",
    "sas",
    "sass",
    "scala",
    "scheme",
    "scss",
    "shaderlab",
    "shader",
    "shellscript",
    "shell",
    "bash",
    "sh",
    "zsh",
    "smalltalk",
    "solidity",
    "sparql",
    "sql",
    "ssh-config",
    "stata",
    "stylus",
    "styl",
    "svelte",
    "swift",
    "system-verilog",
    "tasl",
    "tcl",
    "tex",
    "toml",
    "tsx",
    "turtle",
    "twig",
    "typescript",
    "ts",
    "vb",
    "cmd",
    "verilog",
    "vhdl",
    "viml",
    "vim",
    "vimscript",
    "vue-html",
    "vue",
    "wasm",
    "wenyan",
    "文言",
    "xml",
    "xsl",
    "yaml",
    "zenscript",
  ].includes(value)
}

function rehypeShikiWorker(options: { theme: unknown }) {
  return async function transformer(tree: H.Root) {
    highlighter = highlighter || (await getHighlighter({}))

    const [{ visit, SKIP }, { htmlEscape }, { Tinypool }] = await Promise.all([
      import("unist-util-visit"),
      import("escape-goat"),
      import("tinypool"),
    ])
    // using TinyThread because shiki has some gnarly memory leaks
    // so we stick it in a worker to keep it isolated
    // and configure it so it will be destroyed if it remains unused for a while
    tokenizePool =
      tokenizePool ||
      new Tinypool({
        filename: path.resolve(__dirname, "blog/mdx/rehype-shiki.worker.js"),
        minThreads: 0,
        idleTimeout: 60,
      })

    const nodesToTokenize: Array<{
      preNode: H.Element
      codeString: string
      language: string
      meta: string
    }> = []

    visit(tree, "element", (preNode) => {
      if (
        preNode.tagName !== "pre" ||
        !preNode.children ||
        preNode.properties?.processed
      ) {
        return
      }

      const codeNode = preNode.children[0]
      if (
        !codeNode ||
        codeNode.type !== "element" ||
        codeNode.tagName !== "code"
      ) {
        return
      }

      const meta = codeNode.data?.meta ?? ""
      if (typeof meta !== "string") return

      const className = codeNode.properties?.className
      if (!isArrayOfStrings(className)) return

      let language =
        className
          .find((c) => c.startsWith("language-"))
          ?.slice("language-".length) ?? "txt"

      if (isLangString(language)) {
        const langExists = highlighter.getLoadedLanguages().includes(language)

        if (!langExists) {
          language = "txt"
        }
      } else {
        language = "txt"
      }

      if (codeNode.children.length > 1) {
        console.warn(
          `@kentcdodds/md-temp - Unexpected: ${codeNode.children.length} children`,
        )
        return
      }
      const [firstChild] = codeNode.children
      if (firstChild.type !== "text") {
        console.warn(
          `@kentcdodds/md-temp - Unexpected: firstChild type is not "text": ${firstChild.type}`,
        )
        return
      }
      const { value: codeString } = firstChild
      nodesToTokenize.push({ preNode, codeString, language, meta })
      return SKIP
    })

    for (const nodeStuff of nodesToTokenize) {
      const { preNode, codeString, language, meta } = nodeStuff

      let metaParams = new URLSearchParams()
      if (meta) {
        const encodedMeta =
          decodeURIComponent(meta) !== meta
            ? meta.split(/\s+/).join("&")
            : meta
                .split(/\s+/)
                .map((component) => {
                  const [key, value] = component.split("=")
                  return `${key}=${value ? encodeURIComponent(value) : ""}`
                })
                .join("&")
        metaParams = new URLSearchParams(encodedMeta)
      }

      const addedLines = parseLineRange(metaParams.get("add"))
      const removedLines = parseLineRange(metaParams.get("remove"))
      const highlightLines = parseLineRange(metaParams.get("lines"))
      const startValNum = metaParams.has("start")
        ? Number(metaParams.get("start"))
        : 1
      const startingLineNumber = Number.isFinite(startValNum) ? startValNum : 1
      const numbers = !metaParams.has("nonumber")
      const html = await tokenizePool.run({
        code: codeString,
        language,
        themeJson: options.theme,
        addedLines,
        removedLines,
        highlightLines,
        startingLineNumber,
        numbers,
        shouldRunTwoslash: meta.includes("twoslash"),
      })

      const root = fromHtml(html, {
        fragment: true,
      })

      const metaProps: { [key: string]: string } = {}
      metaParams.forEach((val, key) => {
        if (key === "lines") return
        metaProps[`data-${key}`] = val
      })

      const pre = root.children[0]

      Object.assign(preNode, {
        type: "element",
        tagName: "div",
        properties: {
          ...pre.properties,
          ...metaProps,
          dataLineNumbers: numbers ? "true" : "false",
          dataLang: htmlEscape(language),
          processed: "true",
          className: [
            "pre not-prose -mx-5 overflow-x-auto px-5 py-3 text-[0.8125rem] text-white antialiased sm:mx-0 sm:px-6 rounded-md",
          ],
        },
        children: pre.children,
      })
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

const parseLineRange = (param: string | null) => {
  if (!param) return []
  return rangeParser(param)
}

export { rehypeShikiWorker }
