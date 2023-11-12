import { remember } from "@epic-web/remember"

type Message = {
  id: string
  draftId: string
  body: string
  files: Array<File>
}

type File = {
  url: string
  name: string
  signedUrl: string | null
}

export default remember("db__remixImageUploads", () => {
  return {} as Record<
    string,
    {
      draft: Omit<Message, "draftId">
      messages: Array<Message>
    }
  >
})
