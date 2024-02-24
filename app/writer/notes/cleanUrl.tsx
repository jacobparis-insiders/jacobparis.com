export function cleanUrl(url: string) {
  url = url.replace(/\?.*/, "")
  url = url.replace(/\/$/, "")
  url = url.replace(/https?:\/\/(www\.)?/, "")
  url = url.replace(/\//g, "-")

  return url
}
