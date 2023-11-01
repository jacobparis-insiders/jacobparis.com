import chokidar from "chokidar"
import path from "path"
import fs from "fs"
const watchPath = path.resolve(process.cwd(), "content")
const refreshPath = path.resolve(process.cwd(), "app", "refresh.ignored.js")

chokidar.watch(watchPath).on("change", (changePath) => {
  const relativeChangePath = changePath.replace(
    `${path.resolve(process.cwd(), "content")}/`,
    "",
  )
  console.log("🛠 content changed", relativeChangePath)

  setTimeout(() => {
    fs.writeFileSync(refreshPath, `// ${new Date()}`)
  }, 250)
})
