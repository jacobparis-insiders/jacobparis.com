const commonWords = `
a about after all also an and another any are as at
be because been before being between both but by
came can come could
did do does due doesn't during 
each else
for from further 
get got getting give given gives
has had he have her here him himself his how
if in into is it its
just 
like look long lived
make many me might more most much must my myself
never now 
of on only or other our out over own options full
said same see should since so some still such sure side support supports supporting
take than that the their them then there these they this those through to too
under up use used using utilize 
very
want was way we well were what when where which while who will with would
you your
`
  .trim()
  .replace(/\n/g, " ")
  .replace(/  /g, " ")

export function extractKeywords(content: string) {
  const cursorIndex = content.indexOf("<CURSOR>")

  const keywordMap = new Map<string, number>()

  const wordsBeforeCursor = content.slice(0, cursorIndex).split(" ")
  for (const word of wordsBeforeCursor.reverse()) {
    // if the word is a symbol or a number, skip it
    if (word.match(/^[^a-z]+$/)) {
      continue
    }

    // if the word is a common word, skip it
    if (commonWords.includes(word)) {
      continue
    }

    let score = keywordMap.get(word) || 0

    score += 1

    if (word.charAt(0).toUpperCase() === word.charAt(0)) {
      score += 1
    }

    keywordMap.set(word, score)
  }

  return Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word)
}
