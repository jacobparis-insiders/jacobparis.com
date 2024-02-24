export function extractSnippets(content: string, keywords: string[]) {
  let budget = 2000

  if (content.length < budget) {
    return content
  }

  const markedLines = []
  const lines = content
    .toLowerCase()
    .split("\n")
    .map((line) => line.trim())

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const keyword of keywords) {
      if (line.includes(keyword)) {
        markedLines.push(i)
      }
    }
  }

  // include 5 lines before and after the marked line
  // do not cross section boundaries
  const snippets = []
  // start with the first marked line
  for (let start of markedLines) {
    for (let i = 0; i < 5; i++) {
      if (start > 0 && !lines[start].startsWith("#")) {
        start--
      }
    }

    let linesToWalk = 10
    // walk forward through lines adding each to the snippet
    for (let i = start; i < lines.length; i++) {
      const line = lines[i]
      if (line.length > budget) {
        snippets.push(line)
        budget -= line.length
      } else {
        break
      }

      linesToWalk--

      if (markedLines.includes(i)) {
        // if this is a marked line, reset the linesToWalk counter
        linesToWalk = 10
        // remove this line from the markedLines array so we don't walk it again
        markedLines.splice(markedLines.indexOf(i), 1)
      }

      // if we walk into a section header, stop
      if (line.startsWith("#")) {
        linesToWalk = 0
      }

      if (linesToWalk === 0) {
        break
      }
    }
  }

  const remainingBudget = budget - snippets.join("\n").length
  if (remainingBudget > 100) {
    for (const snippet of snippets) {
      content = content.replace(snippet, "")
    }

    content = content.replace(/\n\s+/g, "\n")

    snippets.push(content.slice(0, remainingBudget))
  }

  return snippets.join("\n")
}
