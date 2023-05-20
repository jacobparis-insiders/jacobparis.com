const path = require("path")
const fs = require("fs")

async function run() {
  const data = {
    timestamp: Date.now(),
  }

  fs.writeFileSync(
    path.join(__dirname, "../public/build/info.json"),
    JSON.stringify(data, null, 2),
  )
}
run()
