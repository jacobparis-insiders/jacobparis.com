import { extractKeywords } from "./extractKeywords"
import { extractSnippets } from "./extractSnippets"
import { localAI, tokenize } from "../gpt.server"
import { basePrompt } from "./copilot.server"

export async function getSentenceSuggestion(content: string, context: string) {
  const keywords = extractKeywords(content)
  console.info("Keywords:", keywords)
  const snippets = extractSnippets(context, keywords)

  const sentencePrompt = `
SUBJECT_MATTER: use the following information as context for your response
${snippets}

INSTRUCTIONS:
- Based on the markdown before the <CURSOR>, write a sentence or two that completes the paragraph. You may use the markdown that follows the <CURSOR> for context, but do not include it in your response.
- replace <CURSOR> with 1 or 2 sentences.
- return only the sentence(s).
- the target audience is technically advanced, but not necessarily familiar with the topic.
- use a voice of expertise but approachability

EXAMPLES:
[INST]## 🔥 Remix feature folders
One approach is to group files by type. All the components go in one folder, all the pages in another, all the styles in another, etc. Models, views, and controllers each get their own folder.
Beginners often pick this approach because it looks clean, in the same way that a workspace where every tool is in a drawer looks clean. Then, when you need to use a tool, you either have to go to the drawer every time to take it out and put it back, or leave it out on the table.
<CURSOR>[/INST]
The other approach is to group files by feature. All the files for a single feature go in one folder.

[INST]## 🔥 Save money by autoscaling your Fly apps to zero when inactive
Now that I had this staging environment, my hosting bill was starting to concern me.
I have A LOT of little side projects and demo examples that I host on Fly, and most of them don't get much of any traffic. But they're all running 24/7, and that adds up.
<CURSOR>[/INST]
But Fly is a serverless platform, even though it deals with containers instead of functions like most serverless platforms.

[INST]## 🔥 I finally set up a staging environment
When trying to deploy the feature folders, I got it wrong a few times and broke my site. It was only ever broken for a minute, because when the new version failed the healthcheck, my hosting provider (Fly.io) would automatically roll back to the previous version.
But I have enough traffic now that while I'm watching the server logs and see it roll back, I can see incoming requests that are failing and I know that people are seeing errors.
<CURSOR>[/INST]
This is great news, technically: Enough people are visiting my site that they notice when it's down.

[INST]## 🔥 Find and fix performance bottlenecks in your Remix app with Server Timing
In this journey of self-improvement I decided to give my site a performance audit, and it was not good.
Over 90% of my homepage load time was spent compiling and syntax highlighting some code snippets I use to demo my VS Code themes, which aren't even shown above the fold!
<CURSOR>[/INST]
I've removed that entirely and now my site is Blazing Fast™! But the interesting bit is how I found that out.
`

  const chatCompletion = await localAI.chat.completions.create({
    messages: [
      {
        role: "system",
        content: tokenize([basePrompt, sentencePrompt].join("\n\n")),
      },
      { role: "user", content: tokenize(content) },
    ],
    model: "",
    frequency_penalty: 0.2,
    max_tokens: 150,
  })

  const cursorPosition = content.indexOf("<CURSOR>")
  const twoCharsAgo = content.charAt(cursorPosition - 2)
  const shouldCapitalize = ["?", "!", ".", "\n"].includes(twoCharsAgo)

  const sentence = chatCompletion.choices[0].message.content?.trim() || ""

  if (shouldCapitalize) {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1)
  } else {
    return sentence.charAt(0).toLowerCase() + sentence.slice(1)
  }
}
