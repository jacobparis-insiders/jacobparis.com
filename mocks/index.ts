import { setupServer } from "msw/node"
import { GitHubMocks } from "./github.ts"

export const server = setupServer(...GitHubMocks)

process.once("SIGINT", () => server.close())
process.once("SIGTERM", () => server.close())
