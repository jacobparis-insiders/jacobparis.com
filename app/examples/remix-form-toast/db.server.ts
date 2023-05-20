type Item = {
  id: number
  title: string
  description?: string
  createdAt: Date
}

declare global {
  var db: {
    items: Array<Item>
  }
}

if (!global.db) {
  global.db = {
    items: [],
  }
}

export const db = global.db
