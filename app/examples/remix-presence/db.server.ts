export type ValidRoute =
  | "/content/remix-presence/example"
  | "/content/remix-other-page"

export type User = {
  id: string
  name: string
  emoji?: string
  lastSeenWhere: ValidRoute
  lastSeenWhen: Date
}

declare global {
  var db__remixPresence: {
    presences: Record<string, User>
  }
}

if (!global.db__remixPresence) {
  global.db__remixPresence = {
    presences: {},
  }
}

export default global.db__remixPresence
