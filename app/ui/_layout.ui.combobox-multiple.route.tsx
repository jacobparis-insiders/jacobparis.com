import { Button } from "#app/components/ui/button.tsx"
import { Input } from "#app/components/ui/input.tsx"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "#app/components/ui/tabs.tsx"
import { ComboboxMultiple } from "#app/components/ui/combobox-multiple.tsx"
import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from "@remix-run/react"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { InlineCode } from "./InlineCode.tsx"
import { LocalStorageDB } from "./LocalStorageDB.tsx"
import { Icon } from "#app/components/icon.tsx"
import { getMeta } from "./getMeta.tsx"
import path from "node:path"
import { readFile } from "fs/promises"

export const frontmatter = {
  title: "Combobox Multiple",
  description:
    "A shadcn-compatible searchable dropdown menu\nthat supports selecting multiple new options and creating new options on the fly",
  img: "http://www.jacobparis.com/images/combobox-multiple.png",
  slug: "combobox-multiple",
}

export const meta = getMeta(frontmatter)

export async function loader() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname)
  const defaultGenres = ["Rock", "Pop", "Jazz"]

  return {
    defaultGenres,
    files: [
      {
        name: "combobox.tsx",
        content: await readFile(
          path.resolve(__dirname, "ui/combobox-multiple.tsx.sly"),
          "utf8",
        ),
      },
    ],
  }
}

clientLoader.hydrate = true
export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const { defaultGenres, files } = await serverLoader<typeof loader>()

  const db = new LocalStorageDB("combobox-multiple:genres")
  const savedGenres = db.findAll()
  if (savedGenres.length === 0) {
    for (const genre of defaultGenres) {
      db.createOne({ name: genre })
    }
  }

  const genres = db.findAll()

  const selectedGenreIds = window.localStorage.getItem(
    "combobox-multiple:selectedGenreIds",
  )
  return {
    defaultGenres,
    genres,
    selectedGenreIds: selectedGenreIds ? selectedGenreIds.split(",") : [],
    files,
  }
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData()
  const db = new LocalStorageDB("combobox-multiple:genres")

  const genreIds = formData.getAll("genreId")
  const newGenreIds = formData
    .getAll("newGenreName")
    .map((name) => db.createOne({ name: name.toString() }))
    .map((genre) => genre.id)

  window.localStorage.setItem(
    "combobox-multiple:selectedGenreIds",
    Array.from(new Set([...genreIds, ...newGenreIds]))
      .map((id) => id.toString())
      .join(","),
  )

  return null
}

export default function Component() {
  const { genres, selectedGenreIds, files } =
    useLoaderData<typeof clientLoader>()

  return (
    <div className="p-8">
      <div className="flex items-center text-2xl font-bold text-neutral-600">
        <Link to="/ui" className="hover:text-black hover:underline">
          jacobparis/ui
        </Link>
        <Icon name="chevron-right" />
        <h1 className="font-bold text-black">Combobox Multiple</h1>
      </div>
      <p className="mt-4">
        A searchable dropdown menu that supports selecting multiple options and
        creating multiple new options on the fly. Also see{" "}
        <Link to="/ui/combobox" className="text-blue-500 hover:underline">
          Combobox Single
        </Link>
      </p>
      <p className="mt-4">
        This is a form component, so wrap it in a{" "}
        <InlineCode>&lt;Form&gt;</InlineCode> and its data will be submitted
        along with the rest of the form. This page submits to local storage,
        which you can clear by opening the browser's developer console and
        running <InlineCode>localStorage.clear()</InlineCode>.
      </p>
      <div className="mt-6">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <Form
              method="POST"
              className="shadow-smooth flex justify-center gap-x-2 rounded-md bg-white p-8"
            >
              <>
                {genres ? (
                  <ComboboxMultiple
                    className="max-w-xs grow"
                    name="genreId"
                    defaultValue={selectedGenreIds}
                    createName="newGenreName"
                    createLabel="Name:"
                    options={genres?.map((genre) => ({
                      label: genre.name,
                      value: genre.id,
                    }))}
                  />
                ) : (
                  <Input
                    className="max-w-xs grow"
                    type="text"
                    disabled={true}
                  />
                )}
                <div className="">
                  <Button>Submit</Button>
                </div>
              </>
            </Form>
          </TabsContent>
          <TabsContent value="code">
            <div className="shadow-smooth rounded-md border bg-black p-4 text-white">
              <div className="flex items-center justify-between">
                <pre className="text-sm">
                  <code>{`<ComboboxMultiple
  name="genreId"
  defaultValue={selectedGenreIds}
  options={genres?.map((genre) => ({
    label: genre.name,
    value: genre.id,
  }))}
  createName="newGenreName"
  createLabel="Name:"
/>`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <h2 className="mt-8 text-2xl font-bold">Installation</h2>

      <div className="mt-6">
        <Tabs defaultValue="cli">
          <TabsList>
            <TabsTrigger value="cli">CLI</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="cli">
            <p className="mt-4">
              You can either copy/paste the code into your project directly or
              use{" "}
              <a
                href="https://sly-cli.fly.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Sly CLI
              </a>{" "}
              to install the package.
            </p>
            <div className="shadow-smooth mt-4  rounded-md bg-black p-4 text-white">
              <code>
                npx @sly-cli/sly@latest add jacobparis/ui combobox-multiple
              </code>
            </div>
          </TabsContent>
          <TabsContent value="manual">
            <ol className="mt-4 space-y-4">
              <li className="">
                Copy and paste the following code into your project.
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="shadow-smooth mt-4 rounded-md border bg-black p-4 text-white"
                  >
                    <pre className="text-sm">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                ))}
              </li>
              <li>Update the import paths to match your project setup.</li>
            </ol>
          </TabsContent>
        </Tabs>
      </div>

      <h2 className="mt-8 text-2xl font-bold"> Multi-select </h2>

      <p className="mt-4">
        Set <InlineCode>mode="multiple"</InlineCode> to enable multi-select.
      </p>

      <div className="mt-6">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="shadow-smooth rounded-md bg-white">
              <Form method="POST" className="flex justify-center gap-x-2 p-8">
                <>
                  {genres ? (
                    <ComboboxMultiple
                      className="max-w-xs grow"
                      name="genreId"
                      defaultValue={selectedGenreIds}
                      options={genres?.map((genre) => ({
                        label: genre.name,
                        value: genre.id,
                      }))}
                    />
                  ) : (
                    <Input
                      className="max-w-xs grow"
                      type="text"
                      disabled={true}
                    />
                  )}
                  <div className="">
                    <Button>Submit</Button>
                  </div>
                </>
              </Form>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="shadow-smooth rounded-md border bg-black p-4 text-white">
              <div className="flex items-center justify-between">
                <pre className="text-sm">
                  <code>{`<ComboboxMultiple
  name="genreId"
  defaultValue={selectedGenreIds}
  options={genres?.map((genre) => ({
    label: genre.name,
    value: genre.id,
  }))}
/>`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="mt-6">
          Submit the combobox in a form and handle the form submission in your
          action function.
        </p>

        <div className="mt-4">
          <div className="shadow-smooth rounded-md border bg-black p-4 text-white">
            <div className="flex items-center justify-between">
              <pre className="text-sm">
                <code>{`
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  // Save them wherever you want
  const genreIds = formData.getAll("genreId")
}
            `}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-bold"> Multi-select + create </h2>

      <p className="mt-4">To allow the user to create items, add these props</p>
      <ul className="ml-4 list-disc">
        <li className="mt-2">
          <InlineCode>createName="newGenreName"</InlineCode> - The FormData key
          for the new items
        </li>
        <li className="mt-2">
          <InlineCode>createLabel="Name:"</InlineCode> - The label shown in the
          dropdown and in the input when the user has selected new items.
        </li>
      </ul>

      <div className="mt-6">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="shadow-smooth rounded-md bg-white">
              <Form method="POST" className="flex justify-center gap-x-2 p-8">
                <>
                  {genres ? (
                    <ComboboxMultiple
                      className="max-w-xs grow"
                      name="genreId"
                      defaultValue={selectedGenreIds}
                      options={genres?.map((genre) => ({
                        label: genre.name,
                        value: genre.id,
                      }))}
                      createName="newGenreName"
                      createLabel="Name:"
                    />
                  ) : (
                    <Input
                      className="max-w-xs grow"
                      type="text"
                      disabled={true}
                    />
                  )}
                  <div className="">
                    <Button>Submit</Button>
                  </div>
                </>
              </Form>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="shadow-smooth rounded-md border bg-black p-4 text-white">
              <div className="flex items-center justify-between">
                <pre className="text-sm">
                  <code>{`<ComboboxMultiple
  name="genreId"
  defaultValue={selectedGenreIds}
  options={genres?.map((genre) => ({
    label: genre.name,
    value: genre.id,
  }))}
  createName="newGenreName"
  createLabel="Name:"
/>`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="mt-6">
          Submit the combobox in a form and handle the form submission in your
          action function.
        </p>

        <div className="mt-4">
          <div className="shadow-smooth rounded-md border bg-black p-4 text-white">
            <div className="flex items-center justify-between">
              <pre className="text-sm">
                <code>{`
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  // User selected these and they already exist
  const genreIds = formData.getAll("genreId")

  // User selected these and they don't exist
  const newGenreNames = formData.getAll("newGenreName")

  const newGenreIds = await Promise.all(newGenreNames.map(async name => {
    const genre = await db.genre.create({
      data: { name },
    })

    return genre.id
  }))

  // Now these all exist, save them wherever you want
  const allGenreIds = [...genreIds, ...newGenreIds]
}
            `}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
