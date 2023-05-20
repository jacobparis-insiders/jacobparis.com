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

declare global {
  var db__remixImageUploads: Record<
    string,
    {
      draft: Omit<Message, "draftId">
      messages: Array<Message>
    }
  >
}

if (!global.db__remixImageUploads) {
  global.db__remixImageUploads = {}
}

export default global.db__remixImageUploads
