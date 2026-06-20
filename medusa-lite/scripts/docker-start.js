const { execSync } = require("child_process")

const DB_URL = process.env.DATABASE_URL || "postgres://medusa:medusa_password@db:5432/medusa_lite"

function waitForDb() {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync(`node -e "require('http').get('http://db:5432', r => r.resume())"`, { timeout: 3000 })
      return
    } catch {
      console.log(`Waiting for database... (${i + 1}/${maxAttempts})`)
    }
  }
  console.log("Database not available after max attempts, continuing anyway")
}

function runMigrations() {
  if (process.env.AUTO_MIGRATE === "false") {
    console.log("AUTO_MIGRATE=false, skipping migrations")
    return
  }
  console.log("Running database migrations...")
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" })
}

function runSeed() {
  if (process.env.AUTO_SEED === "false") {
    console.log("AUTO_SEED=false, skipping seed")
    return
  }
  console.log("Seeding database...")
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })
}

async function main() {
  waitForDb()
  runMigrations()
  runSeed()
  console.log("Starting Next.js...")
}

main()
