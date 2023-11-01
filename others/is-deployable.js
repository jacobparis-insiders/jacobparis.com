import { getChangedFiles } from "./utils.js"

async function go() {
  const changes = getChangedFiles()

  console.log({ changes })

  const isDeployable =
    changes === null ||
    changes.length === 0 ||
    changes.some((change) => !change.filename.startsWith("content/"))

  console.error(isDeployable ? "🟢 Deploy" : "🔴 Skip Deployment")

  console.log(isDeployable)
}

go().catch((error) => {
  console.error(error)
  console.log(true)
})
