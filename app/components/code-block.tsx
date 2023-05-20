import * as React from "react"

import useClipboard from "react-use-clipboard"

export default function CodeBlock(props) {
  const language = props.children.props.className

  const { numbered, linesHighlighted, labeled, filePath } = props

  // extract code from nodes ?
  let code = ""

  // create arrays of arrays wit only spans inside
  const linesArr: React.ReactNode[][] = [[]]

  React.Children.forEach(props.children.props.children, (child) => {
    const index = linesArr.length - 1

    if (typeof child === "string") {
      if (language === "") {
        linesArr.push([child])
      } else {
        linesArr.push([])
      }
      // add to code
      code += child
    } else {
      if (linesArr[index]) {
        linesArr[index].push(child)
      }

      // add content to code
      if (child && typeof child === "object") {
        code += (child as React.ReactElement).props.children
      }
    }
  })

  // transform lines into divs > [span]
  const linesNodes: JSX.Element[] = []
  for (let i = 0; i < linesArr.length; i++) {
    const lineIndex = i + 1
    const childs =
      numbered != undefined
        ? [
            <NumberElement key={`line-number-${lineIndex}`}>
              {lineIndex}
            </NumberElement>,
            linesArr[i],
          ]
        : linesArr[i]

    linesNodes.push(
      <Line
        key={`line-${lineIndex}`}
        highlight={linesHighlighted && linesHighlighted.includes(lineIndex)}
      >
        {childs}
      </Line>,
    )
  }

  return (
    <div className="bg-code not-prose relative -mx-5 mb-5 overflow-hidden rounded-none shadow-2xl shadow-sky-900/50 sm:mx-0 sm:rounded-xl">
      {labeled != undefined && (
        <>
          <div className="pointer-events-none select-none px-10 pb-0 pt-3 text-white sm:px-5 sm:pb-3">
            {language.replace("language-", "")}
            <span className="ml-2 font-light">{filePath}</span>
          </div>
          <CopyToClipboard code={code} />
        </>
      )}
      <div className="p-3">
        <pre className="-mx-5 overflow-x-auto px-5 py-0 text-sm text-white sm:mx-0 sm:px-6">
          <code>{linesNodes}</code>
        </pre>
      </div>
    </div>
  )
}

const Line: React.FunctionComponent<{ highlight?: boolean }> = ({
  highlight,
  children,
}) => (
  <div
    style={{
      backgroundColor: highlight ? "#007acc" : "",
    }}
    className={`
    [&:after]:content-['_']
    ${
      highlight
        ? "-mx-4 whitespace-pre-wrap px-4"
        : "whitespace-pre-wrap [&>span]:break-all"
    }`}
  >
    {children}
  </div>
)

const NumberElement: React.FunctionComponent = ({ children }) => (
  <span className="line-number pointer-events-none inline-block w-7 select-none text-xs text-blue-300 opacity-50">
    {children}
  </span>
)

const CopyToClipboard: React.FunctionComponent<{ code: string }> = ({
  code,
}) => {
  const [isCopied, setCopied] = useClipboard(code, { successDuration: 1000 })
  return (
    <button
      onClick={setCopied}
      aria-label="Copy code to clipboard"
      className="absolute right-3 top-4 p-2 transition-all duration-100 ease-in-out hover:text-white"
    >
      {isCopied ? (
        // prettier-ignore
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
      ) : (
        // prettier-ignore
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></g></svg>
      )}
    </button>
  )
}

type MetaParams = {
  numbered: boolean
  labeled: boolean
  linesHighlighted: number[]
  filePath?: string
}

export const paramsFromMetastring = (str: string): MetaParams => {
  // numbered check if str contains numbered;
  if (!str || !str.length) {
    return {
      numbered: false,
      labeled: false,
      filePath: "",
      linesHighlighted: [],
    }
  }

  const numbered = str.includes("numbered")
  const labeled = str.includes("labeled")

  // highlighted lines are ranges inside {} connect by -, each range is comma separated
  // example: {1-3, 6-10} will highlight lines n [1,2,3,6,7,8,9,10];
  const linesHighlighted: number[] = []
  const lines = str.match(/{.+}/gm)
  if (lines) {
    // remove brackets
    const line = lines[0].replace("{", "").replace("}", "")
    const ranges = line.split(",")
    for (const range of ranges) {
      // get lower and upper bound (inclusive)
      const [lower, upper = lower] = range.split("-")

      for (let i = Number(lower); i <= Number(upper); i++) {
        linesHighlighted.push(i)
      }
    }
  }

  // path is a string contained between []
  const pathMatch = str.match(/\[.+\]/gm)
  const filePath = pathMatch
    ? typeof pathMatch[0] === "string"
      ? pathMatch[0].substr(1, pathMatch[0].length - 2)
      : ""
    : ""

  // eslint-disable-next-line
  return {
    numbered,
    labeled,
    filePath,
    linesHighlighted: [...(new Set(linesHighlighted) as any)],
  }
}
