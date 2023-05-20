declare global {
  var db__remixMarkdownPreviewForm: Record<
    string,
    {
      description: string | null
      preview: string | null
    }
  >
}

if (!global.db__remixMarkdownPreviewForm) {
  global.db__remixMarkdownPreviewForm = {}
}

export default global.db__remixMarkdownPreviewForm
