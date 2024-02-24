import { remember } from "@epic-web/remember"
import OpenAI from "openai"

export const localAI = remember(
  "localAI",
  () =>
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "http://localhost:1234/v1",
    }),
)

export function tokenize(instruction: string, response: string = "") {
  return `[INST] ${instruction} [/INST] ${response}`
}
