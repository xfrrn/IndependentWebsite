const { execSync } = require("child_process")

const DB_URL = process.env.DATABASE_URL || "postgres://medusa:medusa_password@db:5432/medusa_lite"

// Ensure npm uses China mirror inside container
execSync("npm config set registry https://registry.npmmirror.com", { stdio: "pipe" })

function waitForDb() {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync(`node -e "const net=require('net');const c=net.createConnection(5432,'db',()=>{c.end();process.exit(0)});c.on('error',()=>{c.destroy();process.exit(1)});setTimeout(()=>{c.destroy();process.exit(1)},2000)"`, { timeout: 5000 })
      console.log("Database is ready!")
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
