const { spawn } = require("node:child_process")
const net = require("node:net")

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
      ...options,
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
      }
    })
  })
}

async function waitForTcp(url, label) {
  const parsed = new URL(url)
  const host = parsed.hostname
  const port = Number(parsed.port)

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const ready = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port })
      socket.setTimeout(2000)
      socket.once("connect", () => {
        socket.destroy()
        resolve(true)
      })
      socket.once("timeout", () => {
        socket.destroy()
        resolve(false)
      })
      socket.once("error", () => resolve(false))
    })

    if (ready) {
      console.log(`${label} is ready`)
      return
    }

    console.log(`Waiting for ${label} (${attempt}/60)...`)
    await wait(2000)
  }

  throw new Error(`${label} did not become ready in time`)
}

async function getRegionCount() {
  const { Client } = require("pg")
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  await client.connect()
  try {
    const result = await client.query('select count(*)::int as count from "region"')
    return result.rows[0]?.count ?? 0
  } finally {
    await client.end()
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await waitForTcp(process.env.DATABASE_URL, "Postgres")
  }

  if (process.env.REDIS_URL) {
    await waitForTcp(process.env.REDIS_URL, "Redis")
  }

  if (process.env.AUTO_MIGRATE !== "false") {
    await run("npx", ["medusa", "db:migrate"])
  }

  if (process.env.AUTO_SEED !== "false") {
    const regionCount = await getRegionCount().catch((error) => {
      console.warn(`Could not check seed state: ${error.message}`)
      return 0
    })

    if (regionCount === 0) {
      await run("npm", ["run", "seed"])
    } else {
      console.log("Seed data already exists; skipping seed")
    }
  }

  await run("npm", ["run", "dev"])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
