import { getBulletSuggestion } from "./getBulletSuggestion"
import { getSentenceSuggestion } from "./getSentenceSuggestion"
import { getTitleSuggestion } from "./getTitleSuggestion"

export const basePrompt =
  `You are Copilot, an autocomplete bot providing Markdown-based writing assistance.`.trim()

function getSection(context) {
  const [prefix, suffix] = context.split("<CURSOR>")
  const localPrefix = prefix.slice(prefix.lastIndexOf("##")).trim()

  if (localPrefix.match(/\n\s*##\s*[^\n]*$/)) {
    return "title"
  }

  // if prefix contains a newline followed by a bullet with no further newlines, then we're in a bullet list
  // also check for numeric lists
  if (
    localPrefix.match(/\n\s*-\s*[^\n]*$/) ||
    localPrefix.match(/\n\s*\d+\.\s*[^\n]*$/)
  ) {
    return "bullet"
  }

  return "sentence"
}
export async function completion(
  prefix: string,
  suffix: string,
  context: string,
) {
  const localPrefix = prefix.slice(prefix.lastIndexOf("##")).trim()
  const localSuffix = suffix.slice(0, suffix.indexOf("##")).trim()

  // if prefix contains a newline followed by at least two hashes with no further newlines, then we're in a title
  if (localPrefix.match(/^##\s*[^\n]*$/)) {
    return getTitleSuggestion(`${localPrefix}<CURSOR>${localSuffix}`, context)
  }

  // if prefix contains a newline followed by a bullet with no further newlines, then we're in a bullet list
  // also check for numeric lists
  if (
    localPrefix.match(/\n\s*-\s*[^\n]*$/) ||
    localPrefix.match(/\n\s*\d+\.\s*[^\n]*$/)
  ) {
    return getBulletSuggestion(`${localPrefix}<CURSOR>`, context)
  }

  return getSentenceSuggestion(`${localPrefix}<CURSOR>`, context)
}

export function lowercaseInitialLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export function removeIllegalWords(string: string) {
  return string.replaceAll("<CURSOR>", "")
}
