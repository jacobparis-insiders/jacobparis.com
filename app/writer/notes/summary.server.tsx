export async function fetchResource(url: string) {
  // Fetch jacobparis.com from markdown
  if (url.includes("jacobparis.com/content")) {
    const [_, pathname] = url.split("jacobparis.com/content")

    return fetch(
      `https://raw.githubusercontent.com/jacobparis-insiders/jacobparis.com/main/content/blog${pathname}.mdx`,
    ).then((response) => response.text())
  }

  // If it's a github repo, fetch its readme as markdown
  if (url.includes("github.com")) {
    return getReadmeFromGithubRepo(url)
  }

  return getWebsiteContent(url)
}

async function getReadmeFromGithubRepo(url: string) {
  const [_, pathname] = url.split("github.com")

  let md = await fetch(
    `https://raw.githubusercontent.com${pathname}/main/README.md`,
  ).then((response) => response.text())

  md = removeMarkdownHeadings(md, [
    "thank",
    "support",
    "sponsor",
    "donate",
    "contribut",
    "licen",
    "trouble",
    "acknowledg",
  ])

  md = removeMarkdownLinks(md)

  md = removeDuplicateNewlines(md)

  return md
}

function removeDuplicateNewlines(md: string) {
  // trim whitespace on a line but don't cross multiple lines
  return md.replace(/\n +/g, "\n").replace(/\n\n\n+/g, "\n\n")
}

function removeMarkdownLinks(md: string) {
  return md.replace(/!?\[([^\]]+)\]\([^)]+\)/g, "")
}

function removeMarkdownHeadings(md: string, keywords: Array<string>) {
  let lines = md.split("\n")
  let result = []
  let ignoreStack = [] // Stack to track the levels of headings being ignored

  for (let line of lines) {
    let headingLevel = line.startsWith("#") ? line.match(/^#+/)[0].length : 0

    if (headingLevel > 0) {
      // Determine if the heading should be ignored
      let shouldIgnore = [
        "thank",
        "support",
        "sponsor",
        "donate",
        "contribut",
        "licen",
        "trouble",
        "acknowledg",
      ].some((word) => line.toLowerCase().includes(word))

      if (shouldIgnore) {
        // If the heading should be ignored, push its level onto the stack
        ignoreStack.push(headingLevel)
      } else {
        // If the heading should not be ignored, remove all lower level headings from the stack
        while (
          ignoreStack.length > 0 &&
          ignoreStack[ignoreStack.length - 1] >= headingLevel
        ) {
          ignoreStack.pop()
        }
      }
    }

    // If the ignore stack is empty, add the line to the result
    if (ignoreStack.length === 0) {
      result.push(line)
    }
  }

  md = result.join("\n")

  return md
}

async function getWebsiteContent(url: string) {
  const response = await fetch(url)
  let html = await response.text()
  // strip out non-content elements to reduce noise, including head, script, style, and comments
  html = html.replace(/<head>[\s\S]*<\/head>/gi, "")
  html = html.replace(/<script[\s\S]*<\/script>/gi, "")
  html = html.replace(/<style[\s\S]*<\/style>/gi, "")
  html = html.replace(/<svg[\s\S]*<\/svg>/gi, "")
  html = html.replace(/<img[\s\S]*>/gi, "")
  html = html.replace(/<video[\s\S]*<\/video>/gi, "")
  html = html.replace(/<audio[\s\S]*<\/audio>/gi, "")
  html = html.replace(/<iframe[\s\S]*<\/iframe>/gi, "")

  // remove contents of class attributes while keeping the attribute
  html = html.replace(/class="[^"]*"/gi, (match) => {
    return match.replace(/".*"/, '""')
  })
  // same for style
  html = html.replace(/style="[^"]*"/gi, (match) => {
    return match.replace(/".*"/, '""')
  })
  // remove class="" and style="" attributes
  html = html.replaceAll(`class=""`, "")
  html = html.replaceAll(`style=""`, "")

  html = html.replace(/<span[^>]*>/gi, "")
  html = html.replace(/<\/span>/gi, "")
  html = html.replace(/<div[^>]*>/gi, "")
  html = html.replace(/<\/div>/gi, "")

  html = html.replace(/<p[^>]*>/gi, "")
  html = html.replace(/<\/p>/gi, "")
  html = html.replace(/<ul[^>]*>/gi, "")
  html = html.replace(/<\/ul>/gi, "")
  html = html.replace(/<ol[^>]*>/gi, "")
  html = html.replace(/<\/ol>/gi, "")

  // semantic tags
  html = html.replace(/<article[^>]*>/gi, "")
  html = html.replace(/<\/article>/gi, "")
  html = html.replace(/<section[^>]*>/gi, "")
  html = html.replace(/<\/section>/gi, "")
  html = html.replace(/<header[^>]*>/gi, "")
  html = html.replace(/<\/header>/gi, "")
  html = html.replace(/<footer[^>]*>/gi, "")
  html = html.replace(/<\/footer>/gi, "")
  html = html.replace(/<main[^>]*>/gi, "")
  html = html.replace(/<\/main>/gi, "")

  // body, html, and doctype
  html = html.replace(/<body[^>]*>/gi, "")
  html = html.replace(/<\/body>/gi, "")
  html = html.replace(/<html[^>]*>/gi, "")
  html = html.replace(/<\/html>/gi, "")
  html = html.replace(/<!doctype[^>]*>/gi, "")

  console.log(html)

  return html
}
