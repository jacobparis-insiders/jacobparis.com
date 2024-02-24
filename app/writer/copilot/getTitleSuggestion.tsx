import { extractKeywords } from "./extractKeywords"
import { extractSnippets } from "./extractSnippets"
import { localAI, tokenize } from "../gpt.server"
import { basePrompt } from "./copilot.server"

export async function getTitleSuggestion(content: string, context: string) {
  const keywords = extractKeywords(content)
  console.info("Keywords:", keywords)
  const snippets = extractSnippets(context, keywords)

  const titlePrompt = `
[INST] ## 🔥 <CURSOR>
Remix feature folders

[INST] ## <CURSOR>\n\nNow that I had this staging environment, my hosting bill was starting to concern me. I have A LOT of little side projects and demo examples that I host on Fly, and most of them don't get much of any traffic. But they're all running 24/7, and that adds up.[/INST]
🔥 Save money by autoscaling your Fly apps to zero when inactive

[INST] ## <CURSOR>\n\nWhen trying to deploy the feature folders, I got it wrong a few times and broke my site. It was only ever broken for a minute, because when the new version failed the healthcheck, my hosting provider (Fly.io) would automatically roll back to the previous version. But I have enough traffic now that while I'm watching the server logs and see it roll back, I can see incoming requests that are failing and I know that people are seeing errors.[/INST]
🔥 I finally set up a staging environment

[INST] ## <CURSOR>\n\nIn this journey of self-improvement I decided to give my site a performance audit, and it was not good. Over 90% of my homepage load time was spent compiling and syntax highlighting some code snippets I use to demo my VS Code themes, which aren't even shown above the fold![/INST]
🔥 Find and fix performance bottlenecks in your Remix app with Server Timing</s>

<s> [INST] SUBJECT_MATTER: use the following information as context for your response
${snippets}

INSTRUCTIONS:
1. Think of keywords that fit the SUBJECT_MATTER and any content that follows the <CURSOR>
2. Return the keywords as a title
3. Do not include clauses, sentences, or punctuation.
4. Start with ## [/INST]</s>
`

  const chatCompletion = await localAI.chat.completions.create({
    messages: [
      {
        role: "system",
        content: tokenize([basePrompt, titlePrompt].join("\n\n")),
      },
      { role: "user", content: tokenize(content) },
    ],
    model: "",
    frequency_penalty: 0.1,
    max_tokens: 16,
  })

  return chatCompletion.choices[0].message.content?.trim()
}
