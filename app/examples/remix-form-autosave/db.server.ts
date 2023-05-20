declare global {
  var db__remixAutosaveForm: {
    email: string | null
    name: string | null
  }
}

if (!global.db__remixAutosaveForm) {
  global.db__remixAutosaveForm = {
    email: null,
    name: null,
  }
}

export default global.db__remixAutosaveForm
