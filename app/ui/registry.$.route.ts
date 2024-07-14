import type { LoaderFunctionArgs } from "@remix-run/node"
import { readFile } from "fs/promises"
import path from "path"

export const meta = {
  name: "jacobparis/ui",
  source: "https://github.com/jacobparis-insiders/jacobparis.com",
  description: "UI components, compatible with shadcn/ui design systems.",
  license: "https://github.com/jacobparis-insiders/jacobparis.com",
  tags: ["ui"],
}

export async function loader({ params }: LoaderFunctionArgs) {
  const __dirname = path.dirname(new URL(import.meta.url).pathname)
  let slug = params["*"]
  if (!slug?.endsWith(".json")) {
    throw new Response(null, { status: 404, statusText: "Not Found" })
  }

  if (slug === "ui.json") {
    return {
      version: "1.0.0",
      meta,
      resources: [
        {
          name: "combobox",
          dependencies: [],
          devDependencies: [],
          registryDependencies: [],
        },
        {
          name: "combobox-multiple",
          dependencies: [],
          devDependencies: [],
          registryDependencies: [],
        },
      ],
    }
  }

  if (slug === "ui/combobox.json") {
    return {
      name: "combobox",
      dependencies: [],
      devDependencies: [],
      registryDependencies: [],
      files: [
        {
          name: "combobox.tsx",
          content: await readFile(
            path.resolve(__dirname, "ui/combobox.tsx.sly"),
            "utf8",
          ),
        },
      ],
      meta,
    }
  }

  if (slug === "ui/combobox-multiple.json") {
    return {
      name: "combobox-multiple",
      dependencies: [],
      devDependencies: [],
      registryDependencies: [],
      files: [
        {
          name: "combobox-multiple.tsx",
          content: await readFile(
            path.resolve(__dirname, "ui/combobox-multiple.tsx.sly"),
            "utf8",
          ),
        },
      ],
      meta,
    }
  }

  throw new Response(null, { status: 404, statusText: "Not Found" })
}
