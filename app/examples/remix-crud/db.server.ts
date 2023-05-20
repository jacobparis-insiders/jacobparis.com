export type Issue = {
  id: number
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
  clientId: string
}

declare global {
  var db__remixCrud: Record<
    string,
    {
      issues: Array<Issue>
      nextId: number
    }
  >
}

if (!global.db__remixCrud) {
  global.db__remixCrud = {}
}

export default global.db__remixCrud
