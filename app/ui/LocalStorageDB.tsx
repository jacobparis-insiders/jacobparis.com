interface StorageItem {
  id: string
  [key: string]: any
}

export class LocalStorageDB {
  private storageKey: string
  private counter = 0

  constructor(storageKey: string) {
    this.storageKey = storageKey
    if (!window.localStorage.getItem(this.storageKey)) {
      window.localStorage.setItem(this.storageKey, JSON.stringify([])) // Initialize storage with an empty array
    }
    this.counter = parseInt(
      window.localStorage.getItem(this.storageKey + ":counter") || "0",
      36,
    )
  }

  private generateId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(36) // Base-36 encoded current timestamp in seconds
    const randomElement = Math.floor(Math.random() * 46656)
      .toString(36)
      .padStart(3, "0") // Random number in base-36, padded
    const counter = (this.counter++ % 46656).toString(36).padStart(3, "0") // Incrementing counter in base-36, max 3 chars

    // Update the counter in window.localStorage
    window.localStorage.setItem(
      this.storageKey + ":counter",
      this.counter.toString(36),
    )
    return timestamp + randomElement + counter // Concatenate parts
  }

  createOne(data: Omit<StorageItem, "id">): StorageItem {
    const currentData: StorageItem[] = JSON.parse(
      window.localStorage.getItem(this.storageKey) || "[]",
    )
    const newItem: StorageItem = { ...data, id: this.generateId() }
    currentData.push(newItem)
    window.localStorage.setItem(this.storageKey, JSON.stringify(currentData))
    return newItem
  }

  findAll(): StorageItem[] {
    return JSON.parse(window.localStorage.getItem(this.storageKey) || "[]")
  }

  reset(): void {
    window.localStorage.setItem(this.storageKey, JSON.stringify([]))
    window.localStorage.setItem(this.storageKey + ":counter", "0") // Reset the counter
    this.counter = 0 // Also reset the internal static counter
  }
}
