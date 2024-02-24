import { localAI, tokenize } from "./gpt.server"

const basePrompt = `You are a summary writer. You are given a website and asked to summarize it.`
export async function getWebsiteSummary(content: string) {
  let prompt = `
As a professional summarizer, create a concise and comprehensive summary of the provided text, be it an article, post, conversation, or passage, while adhering to these guidelines:

1. Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity and conciseness.
2. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.
3. Rely strictly on the provided text, without including external information.
4. Format the summary in bullet point form for easy understanding.
5. Respond only with the bullet points, do not acknowledge the prompt or provide any other information.

${content}
`
  if (prompt.length > 10000) {
    console.log("Trimming prompt from ", prompt.length, "characters")
    prompt = prompt.slice(0, 10000)
  }
  console.log("About to summarize:", prompt.length, "characters")

  const summary = await localAI.chat.completions.create({
    messages: [
      {
        role: "system",
        content: tokenize(basePrompt),
      },
      { role: "user", content: tokenize(prompt) },
    ],
    model: "",
    frequency_penalty: 0.2,
    max_tokens: 300,
  })

  return summary.choices[0].message.content?.trim()
}
