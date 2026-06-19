const crypto = require("node:crypto")
const fs = require("node:fs")
const path = require("node:path")

const envPath = path.resolve(process.cwd(), ".env.production")

function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex")
}

function randomPassword(bytes = 24) {
  return crypto
    .randomBytes(bytes)
    .toString("base64url")
    .replace(/-/g, "A")
    .replace(/_/g, "z")
}

function parseEnv(raw) {
  const lines = raw.split(/\r?\n/)
  const values = new Map()

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const index = trimmed.indexOf("=")

    if (index !== -1) {
      values.set(trimmed.slice(0, index), trimmed.slice(index + 1))
    }
  }

  return values
}

function isWeak(value) {
  return (
    !value ||
    /^replace_/i.test(value) ||
    /replace_me/i.test(value) ||
    /supersecret/i.test(value) ||
    value === "123456" ||
    value === "local-content-secret"
  )
}

const existing = fs.existsSync(envPath)
  ? parseEnv(fs.readFileSync(envPath, "utf8"))
  : new Map()

const env = {
  PRIMARY_DOMAIN: existing.get("PRIMARY_DOMAIN") || "kidgofun.com",
  SECONDARY_DOMAIN: existing.get("SECONDARY_DOMAIN") || "ttgo.shop",
  NEXT_PUBLIC_BASE_URL:
    existing.get("NEXT_PUBLIC_BASE_URL") || "https://kidgofun.com",
  STOREFRONT_BASE_URL:
    existing.get("STOREFRONT_BASE_URL") || "https://kidgofun.com",
  NEXT_PUBLIC_DEFAULT_REGION:
    existing.get("NEXT_PUBLIC_DEFAULT_REGION") || "dk",
  DEFAULT_STORE_COUNTRY_CODE:
    existing.get("DEFAULT_STORE_COUNTRY_CODE") || "dk",
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:
    existing.get("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY") || "pk_live_replace_me",
  ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT: "false",
  AUTO_MIGRATE: "false",
  AUTO_SEED: "false",
  AUTO_ADMIN_USER: "false",
  STORE_CORS:
    existing.get("STORE_CORS") ||
    "https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop",
  ADMIN_CORS:
    existing.get("ADMIN_CORS") ||
    "https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop",
  AUTH_CORS:
    existing.get("AUTH_CORS") ||
    "https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop",
  POSTGRES_USER: existing.get("POSTGRES_USER") || "medusa",
  POSTGRES_PASSWORD: isWeak(existing.get("POSTGRES_PASSWORD"))
    ? randomPassword()
    : existing.get("POSTGRES_PASSWORD"),
  POSTGRES_DB: existing.get("POSTGRES_DB") || "medusa_db",
  REDIS_PASSWORD: isWeak(existing.get("REDIS_PASSWORD"))
    ? randomPassword()
    : existing.get("REDIS_PASSWORD"),
  JWT_SECRET: isWeak(existing.get("JWT_SECRET"))
    ? randomHex()
    : existing.get("JWT_SECRET"),
  COOKIE_SECRET: isWeak(existing.get("COOKIE_SECRET"))
    ? randomHex()
    : existing.get("COOKIE_SECRET"),
  CONTENT_ADMIN_SECRET: isWeak(existing.get("CONTENT_ADMIN_SECRET"))
    ? randomHex()
    : existing.get("CONTENT_ADMIN_SECRET"),
  CONTENT_MANAGER_KEY: isWeak(existing.get("CONTENT_MANAGER_KEY"))
    ? randomPassword(32)
    : existing.get("CONTENT_MANAGER_KEY"),
  REVALIDATE_SECRET: isWeak(existing.get("REVALIDATE_SECRET"))
    ? randomHex()
    : existing.get("REVALIDATE_SECRET"),
}

const output = `# Domains
PRIMARY_DOMAIN=${env.PRIMARY_DOMAIN}
SECONDARY_DOMAIN=${env.SECONDARY_DOMAIN}

# Public URLs. kidgofun.com is the canonical storefront URL; ttgo.shop also serves the same site.
NEXT_PUBLIC_BASE_URL=${env.NEXT_PUBLIC_BASE_URL}
STOREFRONT_BASE_URL=${env.STOREFRONT_BASE_URL}

# Storefront region and Medusa publishable key.
# The publishable key must exist in the Medusa database and be linked to the sales channel.
NEXT_PUBLIC_DEFAULT_REGION=${env.NEXT_PUBLIC_DEFAULT_REGION}
DEFAULT_STORE_COUNTRY_CODE=${env.DEFAULT_STORE_COUNTRY_CODE}
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT=${env.ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT}
AUTO_MIGRATE=${env.AUTO_MIGRATE}
AUTO_SEED=${env.AUTO_SEED}
AUTO_ADMIN_USER=${env.AUTO_ADMIN_USER}

# CORS for both domains.
STORE_CORS=${env.STORE_CORS}
ADMIN_CORS=${env.ADMIN_CORS}
AUTH_CORS=${env.AUTH_CORS}

# Database and Redis.
POSTGRES_USER=${env.POSTGRES_USER}
POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD}
POSTGRES_DB=${env.POSTGRES_DB}
REDIS_PASSWORD=${env.REDIS_PASSWORD}

# Server secrets. Generated locally; do not commit this file.
JWT_SECRET=${env.JWT_SECRET}
COOKIE_SECRET=${env.COOKIE_SECRET}
CONTENT_ADMIN_SECRET=${env.CONTENT_ADMIN_SECRET}
CONTENT_MANAGER_KEY=${env.CONTENT_MANAGER_KEY}
REVALIDATE_SECRET=${env.REVALIDATE_SECRET}
`

fs.writeFileSync(envPath, output)

console.log("Generated .env.production with strong local secrets.")
console.log(
  "Review NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY before production deploy; it must match your Medusa production database."
)
