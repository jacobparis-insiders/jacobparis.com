declare global {
  var db__remixAutosaveForm: Record<
    string,
    {
      email: string | null
      name: string | null
    }
  >
}

if (!global.db__remixAutosaveForm) {
  global.db__remixAutosaveForm = {}
}

export default global.db__remixAutosaveForm
