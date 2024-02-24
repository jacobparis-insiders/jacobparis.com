import { extractKeywords } from "./extractKeywords"
import { extractSnippets } from "./extractSnippets"
import { localAI, tokenize } from "../gpt.server"
import {
  basePrompt,
  lowercaseInitialLetter,
  removeIllegalWords,
} from "./copilot.server"

export async function getBulletSuggestion(content: string, context: string) {
  const lines = content.split("\n")
  const cursorLine = lines.find((line) => line.includes("<CURSOR>"))

  if (!cursorLine) {
    throw new Error("Cursor line not found")
  }

  const keywords = extractKeywords(cursorLine)
  console.info("Keywords:", keywords)
  const snippets = extractSnippets(context, keywords)

  const bulletPrompt = `
CONTEXT: use the following snippets of information as context for your response
${snippets}

EXAMPLES:
[INST]## 📄 Remix feature folders
I strongly favor the feature approach, especially for how it enables colocation
- I write code inline exactly where I need it, without having to think about how this can be re-used.
- Once it works and covers all the use-cases it needs to, then I extract the logic into its own component or function, but it stays in the same file.
- When it needs to be used in a way that maximizes efficiency and maintainability, <CURSOR>[/INST]
ensuring code reuse across different parts of the project.

[INST]## Sly is a CLI tool to add components, icons, and utilities as code, not dependencies.
With one command, or through an interactive prompt, you can choose a component from Sly's registry and it will appear in your codebase, in exactly the format it would be if you had written it yourself.

- Automatically customize each component with transformers.
- Write postinstall scripts that run each time you add a component.
- Only source code, no minified bundle output.
- Prevent supply chain attacks by detaching from automatic updates.
- <CURSOR>[/INST]
Ensure full control over versioning and updates, thereby increasing security and stability of the codebase.
`

  const shouldCreateNewBullet =
    cursorLine.replace("<CURSOR>", "").replace("-", "").trim().length < 5

  const chatCompletion = await localAI.chat.completions.create({
    messages: [
      {
        role: "system",
        content: tokenize([basePrompt, bulletPrompt].join("\n\n")),
      },
      {
        role: "user",
        content: shouldCreateNewBullet
          ? tokenize(`
STEP-BY-STEP INSTRUCTIONS:
1. Read the existing bullet points and see how they relate to the context.
2. Write another bullet point beginning with ${cursorLine.replace(
              "<CURSOR>",
              "",
            )}.
3. STOP when you reach the end of the sentence. Do not continue the sentence beyond the end of the sentence. Do not include the prompt in your reply. 

${content}
`)
          : tokenize(`
STEP-BY-STEP INSTRUCTIONS:
1. Read the existing bullet points and see how they relate to the context.
2. Write a sentence beginning with ${cursorLine.replace("<CURSOR>", "")}
3. Avoid starting a new sentence; the goal is to seamlessly complete the existing sentence.
4. STOP when you reach the end of the sentence. Do not continue the sentence beyond the end of the sentence. Do not include the prompt in your reply. DO NOT START A NEW BULLET POINT.

${content}
`),
      },
    ],
    model: "",
    frequency_penalty: 0.2,
    max_tokens: 50,
    temperature: 0.1,
  })

  const sentence = chatCompletion.choices[0].message.content?.trim() || ""

  return lowercaseInitialLetter(removeIllegalWords(sentence))
}
