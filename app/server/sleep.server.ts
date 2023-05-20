let sleepTimeout: NodeJS.Timeout

export function keepAwake() {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout)
  }

  if (process.env.AUTOSLEEP_MINUTES) {
    sleepTimeout = setTimeout(
      () => process.exit(0),
      1000 * 60 * Number(process.env.AUTOSLEEP_MINUTES),
    )
  }
}
