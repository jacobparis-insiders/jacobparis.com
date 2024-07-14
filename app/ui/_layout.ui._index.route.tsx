import { Link } from "@remix-run/react"

export default function Component() {
  return (
    <div className="p-8">
      <div className="flex items-center text-2xl">
        <h1 className="font-bold text-black">jacobparis/ui</h1>
      </div>

      <p className="mt-4">
        A small collection of UI components I've been using in my projects.
        These are compatible with, inspired by, and in some cases built upon the{" "}
        <a
          href="https://ui.shadcn.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          shadcn/ui{" "}
        </a>
        project.
      </p>

      <div className="mt-4">
        <ul className="ml-4 list-disc">
          <li>
            <Link to="/ui/combobox" className="text-blue-500 hover:underline">
              Combobox
            </Link>
          </li>
          <li>
            <Link to="/ui/combobox" className="text-blue-500 hover:underline">
              Combobox Multiple
            </Link>
          </li>
        </ul>
      </div>

      <h2 className="mt-8 text-2xl font-bold">Installation</h2>

      <p className="mt-4">
        You can either copy/paste each component into your project directly or
        use{" "}
        <a
          href="https://sly-cli.fly.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Sly CLI
        </a>
        . Sly is an open source CLI with a self-hostable registry for
        distributing components, icons, and utility functions.
      </p>

      <p className="mt-4">
        To interactively browse all available components, run the following
        command:
      </p>
      <div className="shadow-smooth mt-4  rounded-md bg-black p-4 text-white">
        <code>npx @sly-cli/sly@latest add jacobparis/ui</code>
      </div>
    </div>
  )
}
