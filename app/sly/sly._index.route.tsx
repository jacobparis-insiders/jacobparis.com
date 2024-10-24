import { Icon } from "#app/components/icon.tsx"
import { Button } from "#app/components/ui/button.tsx"
import { Link, useLoaderData } from "@remix-run/react"
import { useState, useEffect, useRef } from "react"

import slyLogomarkSvg from "./assets/logomark.svg"
import {
  TerminalTabs,
  TerminalTabsContent,
  TerminalTabsList,
  TerminalTabsTrigger,
} from "./terminal-tabs.tsx"
import { flushSync } from "react-dom"

import type { LoaderFunctionArgs } from "@remix-run/node"
import { getIconifyIndex } from "./iconify.ts"
import { cache, cachified } from "#app/cache/cache.server.ts"

interface IconLibrary {
  key: string
  displayName: string
}

const iconNames = [
  "arrow-left",
  "arrow-right",
  "check",
  "close",
  "download",
  "home",
  "menu",
  "search",
  "settings",
  "user",
]

interface FileItem {
  name: string
  type: "file" | "terminal" | "heading"
  directory?: string
  content?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const iconLibraries = await cachified({
    key: "iconify-index",
    cache: cache,
    getFreshValue: async () => {
      const index = await getIconifyIndex()
      return Object.entries(index)
        .map(([key, library]) => ({
          key,
          name: library.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
  })

  return {
    iconLibraries,
  }
}

export default function Component() {
  const { iconLibraries } = useLoaderData<typeof loader>()
  const [output, setOutput] = useState("> npx @sly-cli/sly add")
  const [isRunning, setIsRunning] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const outputRef = useRef<HTMLPreElement>(null)
  const [slyJson, setSlyJson] = useState({
    $schema: "https://sly-cli.fly.dev/registry/config/v2.json",
    config: {
      icons: {},
    },
    libraries: {},
  })
  const [fileList, setFileList] = useState<FileItem[]>([
    {
      name: "sly.json",
      type: "file",
      content: JSON.stringify(slyJson, null, 2),
    },
  ])
  const [selectedFile, setSelectedFile] = useState<FileItem>({
    name: "Terminal",
    type: "terminal",
  })

  const commandRef = useRef(0)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    setFileList((prevList) => {
      const newList = [...prevList]
      const slyJsonFile = newList.find((item) => item.name === "sly.json")
      if (slyJsonFile) {
        slyJsonFile.content = JSON.stringify(slyJson, null, 2)
      }
      return newList
    })
  }, [slyJson])

  const updateFileList = (newDirectory: string, newFile: string) => {
    setFileList((prevList) => {
      if (!prevList.some((item) => item.name === newFile)) {
        return [
          ...prevList,
          {
            name: newFile,
            directory: newDirectory,
            type: "file",
            content: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/></svg>`,
          },
        ]
      }
      return prevList
    })
  }

  async function deleteFile(fileName: string) {
    setFileList((prevList) => prevList.filter((file) => file.name !== fileName))
    if (selectedFile?.name === fileName) {
      setSelectedFile(fileList.find((file) => file.name === "Terminal") || null)
    }
  }

  async function configureLibrary(library: IconLibrary, commandId: number) {
    if (commandRef.current !== commandId) return

    const libraryConfig = slyJson.libraries[library.key]
    if (libraryConfig) {
      const resolvedConfig =
        typeof libraryConfig.config === "string"
          ? slyJson.config[libraryConfig.config]
          : libraryConfig.config

      if (commandRef.current !== commandId) return
      setOutput(
        (prev) =>
          prev +
          `${library.displayName} found in sly.json. Using ${resolvedConfig.directory}.\n`,
      )

      return {
        directory: resolvedConfig.directory,
      }
    }

    if (commandRef.current !== commandId) return
    setOutput(
      (prev) =>
        prev +
        `\n✔ Pick a directory for ${library.displayName} … ./components\n`,
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (commandRef.current !== commandId) return
    setOutput(
      (prev) =>
        prev + `✔ Run a command after installing ${library.displayName}? … \n`,
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (commandRef.current !== commandId) return
    setOutput((prev) => prev + "? Save settings to sly.json? › (Y/n)")
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (commandRef.current !== commandId) return
    setOutput((prev) => prev + " y\n")

    if (commandRef.current !== commandId) return
    setSlyJson((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        icons: {
          ...prev.config.icons,
          directory: "./components",
        },
      },
      libraries: {
        ...prev.libraries,
        [library.key]: {
          config: "icons",
          name: library.displayName,
        },
      },
    }))

    return {
      directory: "./components",
    }
  }

  function addFile({
    filename,
    directory,
  }: {
    filename: string
    directory: string
  }) {
    setOutput(
      (prev) =>
        prev +
        `\n: Adding ${filename}...\n✓ Added ${directory}/${filename}.svg\n`,
    )
    updateFileList(directory, `${filename}.svg`)
  }

  async function interactiveAddRandomIcon(commandId: number) {
    setOutput(
      (output) => output + `\n? Which icon would you like to add? › \n\n`,
    )

    if (commandRef.current !== commandId) return
    iconNames.forEach((icon) => {
      setOutput((prev) => prev + `◯  ${icon}\n`)
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const randomIconIndex = Math.floor(Math.random() * iconNames.length)
    const chosenIcon = iconNames[randomIconIndex]

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (commandRef.current !== commandId) return
    setOutput((prev) => {
      const lines = prev.split("\n").map((line) => {
        if (line.includes("◯") && line.includes(chosenIcon)) {
          return line.replace("◯", "●")
        }
        return line
      })

      return lines.join("\n")
    })

    if (commandRef.current !== commandId) return
    setOutput(
      (prev) =>
        prev + `\n✔ Which icon would you like to add? · ${chosenIcon}\n`,
    )

    return {
      icon: chosenIcon,
    }
  }

  async function interactiveChooseRandomLibrary(commandId: number) {
    if (commandRef.current !== commandId) return

    const iconLibraries = Object.entries(iconLibraries).map(
      ([key, library]) => ({
        key,
        name: library.name,
      }),
    )

    setOutput(
      (output) =>
        output + "? Which icon libraries would you like to use? › \n\n",
    )

    if (commandRef.current !== commandId) return
    Object.entries(iconLibraries).forEach(([key, library]) => {
      setOutput((prev) => prev + `◯  ${library.name}\n`)
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const randomLibraryIndex = Math.floor(Math.random() * iconLibraries.length)
    const chosenLibrary = iconLibraries[randomLibraryIndex]

    if (commandRef.current !== commandId) return
    setOutput((prev) => {
      const lines = prev.split("\n")
      lines[randomLibraryIndex + 2] = lines[randomLibraryIndex + 2].replace(
        "◯",
        "●",
      )
      return lines.join("\n")
    })

    await new Promise((resolve) => setTimeout(resolve, 500))
    if (commandRef.current !== commandId) return
    setOutput(
      (prev) =>
        prev +
        `\n✔ Which icon libraries would you like to use? · ${chosenLibrary.name}\n`,
    )

    return {
      library: chosenLibrary,
    }
  }

  return (
    <div className="pb-24">
      <div className="relative grid grid-cols-[repeat(auto-fit,_100px)] justify-center">
        <header className="col-span-full mt-[25px] grid grid-cols-[50px_1fr] items-center">
          <Logo />
        </header>
      </div>

      <div
        className={`relative z-10 mx-auto my-auto mb-12 flex min-h-full max-w-7xl flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8`}
      >
        <div className="grow" />

        <h1
          className="drop-shadow-smooth animate-fade-in-down mb-6 mt-48 text-center text-5xl font-medium text-neutral-900 sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.7s" }}
        >
          A CLI for icons
        </h1>
        <p
          className="drop-shadow-smooth animate-fade-in-down sm:text-2x mb-10 text-center text-xl  text-neutral-600"
          style={{ animationDelay: "0.9s" }}
        >
          Run this command and icons will appear in your codebase
        </p>
        <div
          className="animate-fade-in-down  mx-auto w-full max-w-3xl  text-left"
          style={{ animationDelay: "1.2s" }}
        >
          <div
            className="shadow-smooth mt-2 flex flex-col overflow-hidden rounded-lg bg-black p-4 font-mono text-white transition-[height]"
            style={{
              height: isExpanded ? "30lh" : "6lh",
            }}
          >
            <TerminalTabs
              value={selectedFile?.name}
              className="-m-4 rounded-none"
            >
              <TerminalTabsList>
                <TerminalTabsTrigger
                  value="Terminal"
                  onClick={() =>
                    setSelectedFile({ name: "Terminal", type: "terminal" })
                  }
                >
                  <Icon name="terminal" className="mr-2" />
                  Terminal
                </TerminalTabsTrigger>
                {fileList.map((item) => (
                  <TerminalTabsTrigger
                    key={item.name}
                    value={item.name}
                    onClick={() => {
                      setSelectedFile(item)
                      setIsExpanded(true)
                    }}
                    isDeletable={item.name !== "sly.json"}
                    onDelete={() => deleteFile(item.name)}
                  >
                    {item.name}
                  </TerminalTabsTrigger>
                ))}
              </TerminalTabsList>
              <TerminalTabsContent value="Terminal">
                <>
                  <div className="flex items-center gap-x-2">
                    <div className="flex space-x-2 px-2">
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={() => {
                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(`> npx @sly-cli/sly\n`)
                          })

                          if (commandRef.current !== thisCommand) return

                          setOutput(
                            (output) =>
                              output +
                              `
Sly CLI v1.0.0

Usage: sly <command> [options]

Commands:
add       Add icons from a library

Options:
-h, --help     Show help                                         [boolean]
-v, --version  Show version number                               [boolean]

Examples:
sly add boxicons menu        Add the 'menu' icon from Boxicons

For more information, visit: https://sly-cli.fly.dev
                            `,
                          )

                          setIsRunning(false)
                        }}
                      >
                        npx sly
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(`> npx @sly-cli/sly add\n`)
                          })

                          if (commandRef.current !== thisCommand) return
                          const { library: chosenLibrary } =
                            (await interactiveChooseRandomLibrary(
                              thisCommand,
                            )) || {}

                          if (commandRef.current !== thisCommand) return
                          const { directory } =
                            (await configureLibrary(
                              chosenLibrary!,
                              thisCommand,
                            )) || {}

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          const { icon } =
                            (await interactiveAddRandomIcon(thisCommand)) || {}

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: icon!, directory })
                        }}
                      >
                        add
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const randomLibrary =
                            iconLibraries[
                              Math.floor(Math.random() * iconLibraries.length)
                            ]

                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(
                              `> npx @sly-cli/sly add ${randomLibrary.key}\n`,
                            )
                          })

                          if (commandRef.current !== thisCommand) return
                          const { directory } =
                            (await configureLibrary(
                              randomLibrary!,
                              thisCommand,
                            )) || {}

                          if (commandRef.current !== thisCommand) return
                          const { icon } =
                            (await interactiveAddRandomIcon(thisCommand)) || {}

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: icon!, directory })
                        }}
                      >
                        &lt;library&gt;
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const randomLibrary =
                            iconLibraries[
                              Math.floor(Math.random() * iconLibraries.length)
                            ]

                          const randomIconName =
                            iconNames[
                              Math.floor(Math.random() * iconNames.length)
                            ]

                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(
                              `> npx @sly-cli/sly add ${randomLibrary.key} ${randomIconName}\n`,
                            )
                          })

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          const { directory } =
                            (await configureLibrary(
                              randomLibrary!,
                              thisCommand,
                            )) || {}

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: randomIconName, directory })
                        }}
                      >
                        &lt;icon&gt;
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const randomLibrary =
                            iconLibraries[
                              Math.floor(Math.random() * iconLibraries.length)
                            ]

                          const randomIconName =
                            iconNames[
                              Math.floor(Math.random() * iconNames.length)
                            ]

                          const directory = "./components"

                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(
                              `> npx @sly-cli/sly add ${randomLibrary.key} ${randomIconName} --directory ${directory}\n`,
                            )
                          })

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: randomIconName, directory })
                        }}
                      >
                        --directory &lt;dir&gt;
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const randomLibrary =
                            iconLibraries[
                              Math.floor(Math.random() * iconLibraries.length)
                            ]

                          const randomIconName =
                            iconNames[
                              Math.floor(Math.random() * iconNames.length)
                            ]

                          const directory = "./components"

                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(
                              `> npx @sly-cli/sly add ${randomLibrary.key} ${randomIconName} --directory ${directory} --overwrite\n`,
                            )
                          })

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: randomIconName, directory })
                        }}
                      >
                        --overwrite
                      </Button>
                      <Button
                        type="button"
                        variant="outline-dark"
                        size="sm"
                        onClick={async () => {
                          const randomLibrary =
                            iconLibraries[
                              Math.floor(Math.random() * iconLibraries.length)
                            ]

                          const randomIconName =
                            iconNames[
                              Math.floor(Math.random() * iconNames.length)
                            ]

                          const directory = "./components"

                          const thisCommand = (commandRef.current += 1)
                          flushSync(() => {
                            commandRef.current = thisCommand
                            setIsExpanded(true)
                            setIsRunning(true)
                            setOutput(
                              `> npx @sly-cli/sly add ${randomLibrary.key} ${randomIconName} --directory ${directory} --overwrite --yes\n`,
                            )
                          })

                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000),
                          )

                          if (commandRef.current !== thisCommand) return
                          addFile({ filename: randomIconName, directory })
                        }}
                      >
                        --yes
                      </Button>
                    </div>
                  </div>

                  <pre
                    ref={outputRef}
                    className="mt-8 flex-grow overflow-y-auto whitespace-pre-wrap break-all px-4"
                  >
                    {output}
                  </pre>
                </>
              </TerminalTabsContent>
              {fileList.map((item) => (
                <TerminalTabsContent key={item.name} value={item.name}>
                  <pre className="whitespace-pre-wrap break-all px-4">
                    {item.content}
                  </pre>
                </TerminalTabsContent>
              ))}
            </TerminalTabs>
          </div>
        </div>
      </div>
      <p
        className="drop-shadow-smooth animate-fade-in-down sm:text-2x mb-10 mt-48 text-center text-xl  text-neutral-600"
        style={{ animationDelay: "0.9s" }}
      >
        Powered by{" "}
        <a
          href="https://iconify.design?utm_source=sly-cli"
          target="_blank"
          className="font-black text-black underline"
          rel="noreferrer"
        >
          Iconify
        </a>
      </p>

      <ul className="columns-3 text-center text-sm text-neutral-600">
        {Object.entries(iconLibraries).map(([key, library]) => (
          <li key={key}> {library.name} </li>
        ))}
      </ul>

      <div className="mt-48  flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className="drop-shadow-smooth animate-fade-in-down  text-center text-4xl font-medium text-neutral-900">
          Turn SVG Files into Spritesheets
        </h2>
        <p className="drop-shadow-smooth animate-fade-in-down sm:text-2x text-center text-xl  text-neutral-600">
          Spritesheets are the fastest and most efficient way to ship icons.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        <div className="shadow-smooth flex flex-col overflow-hidden rounded-lg border border-neutral-100 bg-white dark:bg-gray-800">
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Icon name="command" className="h-6 w-6" />
              With Vite
            </div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Use a vite plugin to bundle a directory of SVG icons into a
              spritesheet.
            </p>
          </div>
          <div className="mt-auto p-4">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 font-mono text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              to="https://github.com/forge42dev/vite-plugin-icons-spritesheet"
            >
              <Icon name="github-logo" className="mr-2 h-4 w-4" />
              View plugin
            </Link>
          </div>
        </div>
        <div className="shadow-smooth flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800">
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Icon name="terminal" className="h-6 w-6" />
              With CLI
            </div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Bundle your spritesheet with a CLI tool that integrates with Sly's
              postinstall command.
            </p>
          </div>
          <div className="mt-auto p-4">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 font-mono text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              to="https://www.jacobparis.com/content/svg-icons-with-cli"
            >
              Read Article
              <Icon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="shadow-smooth flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800">
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Icon name="file-code-2" className="h-6 w-6" />
              Manual Script
            </div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Create a manual postinstall script that reads your icons directory
              and assembles a spritesheet.
            </p>
          </div>
          <div className="mt-auto p-4">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 font-mono text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              to="https://www.jacobparis.com/content/svg-icons"
            >
              Read Article
              <Icon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-24 flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className="drop-shadow-smooth animate-fade-in-down  text-center text-4xl font-medium text-neutral-900">
          Create an Icon component
        </h2>
        <p className="drop-shadow-smooth animate-fade-in-down sm:text-2x text-center text-xl  text-neutral-600">
          Use this component for type-safe icons in any project.
        </p>
      </div>

      {/* // terminal tabs for each language */}
      <div
        className="animate-fade-in-down shadow-smooth mx-auto mt-8 w-full max-w-3xl bg-white text-left"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="mt-2 flex flex-col overflow-x-auto rounded-lg bg-black p-4 font-mono text-white transition-[height]">
          <TerminalTabs className="-m-4 rounded-none" defaultValue="react">
            <TerminalTabsList>
              <TerminalTabsTrigger value="react">React</TerminalTabsTrigger>
              <TerminalTabsTrigger value="vue">Vue</TerminalTabsTrigger>
              <TerminalTabsTrigger value="svelte">Svelte</TerminalTabsTrigger>
            </TerminalTabsList>
            <TerminalTabsContent value="react">
              <pre className="whitespace-pre-wrap break-all px-4">
                {`
import { type IconName } from './icons/name';
import href from './icons/sprite.svg';

export function Icon({
	name,
	className,
	...props
}: React.SVGProps<SVGSVGElement> & {
	name: IconName;
}) {
	return (
		<svg {...props} className={\`inline self-center \${className}\`}>
			<use href={\`\${href}#\${name}\`} />
		</svg>
	);
}
`}
              </pre>
            </TerminalTabsContent>
            <TerminalTabsContent value="vue">
              <pre className="whitespace-pre-wrap break-all px-4">
                {`
<template>
  <svg v-bind="props" :class="\`inline self-center \${className}\`">
    <use :href="\`\${href}#\${name}\`" />
  </svg>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IconName } from './icons/name';
import href from './icons/sprite.svg';

export default defineComponent({
  name: 'Icon',
  props: {
    name: {
      type: String as PropType<IconName>, 
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    props: {
      type: Object as PropType<Partial<SVGSVGElement>>,
      default: () => ({})
    }
  }
});
</script>
`}
              </pre>
            </TerminalTabsContent>
            <TerminalTabsContent value="svelte">
              <pre className="whitespace-pre-wrap break-all px-4">
                {`
<script lang="ts">
  import { IconName } from './icons/name';
  import href from './icons/sprite.svg';

  export let name: IconName;
  export let className: string = '';
  export let props: Partial<SVGSVGElement> = {};
</script>

<svg {...props} class={\`inline self-center \${className}\`}>
  <use href={\`\${href}#\${name}\`} />
</svg>
`}
              </pre>
            </TerminalTabsContent>
          </TerminalTabs>
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <Link to="/sly" className="group grid leading-snug ">
      <img
        src={slyLogomarkSvg}
        alt="Sly"
        width="118"
        className="drop-shadow-smooth relative max-w-[unset]"
      />
    </Link>
  )
}
