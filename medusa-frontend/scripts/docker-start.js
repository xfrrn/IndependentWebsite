const { spawn } = require("node:child_process")

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchPublishableKey() {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://medusa-backend:9000"

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(`${backendUrl}/publishable-key`)

      if (response.ok) {
        const json = await response.json()

        if (json.publishable_key) {
          return json.publishable_key
        }
      }
    } catch {}

    console.log(`Waiting for Medusa publishable key (${attempt}/60)...`)
    await wait(2000)
  }

  throw new Error("Medusa publishable key did not become available in time")
}

async function main() {
  if (
    !process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY === "auto"
  ) {
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = await fetchPublishableKey()
  }

  const child = spawn("npm", ["run", "dev", "--", "-H", "0.0.0.0"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  })

  child.on("exit", (code) => process.exit(code ?? 0))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
