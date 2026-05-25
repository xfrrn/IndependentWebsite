const fs = require("node:fs")
const path = require("node:path")

const envPath = path.resolve(process.cwd(), ".env.production")

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.production. Copy .env.production.example first.")
  process.exit(1)
}

const raw = fs.readFileSync(envPath, "utf8")
const env = Object.fromEntries(
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=")
      return index === -1
        ? [line, ""]
        : [line.slice(0, index), line.slice(index + 1)]
    })
)

const required = [
  "PRIMARY_DOMAIN",
  "SECONDARY_DOMAIN",
  "NEXT_PUBLIC_BASE_URL",
  "STOREFRONT_BASE_URL",
  "NEXT_PUBLIC_DEFAULT_REGION",
  "DEFAULT_STORE_COUNTRY_CODE",
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  "STORE_CORS",
  "ADMIN_CORS",
  "AUTH_CORS",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DB",
  "REDIS_PASSWORD",
  "JWT_SECRET",
  "COOKIE_SECRET",
  "CONTENT_ADMIN_SECRET",
  "CONTENT_MANAGER_KEY",
  "REVALIDATE_SECRET",
]

const productionFalseKeys = [
  "ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT",
  "AUTO_MIGRATE",
  "AUTO_SEED",
  "AUTO_ADMIN_USER",
]

const placeholderPatterns = [
  /^replace_/i,
  /replace_me/i,
  /supersecret/i,
  /^123456$/,
  /^local-content-secret$/,
  /^pk_live_replace_me$/,
]

const errors = []

for (const key of required) {
  const value = env[key]

  if (!value) {
    errors.push(`${key} is required`)
    continue
  }

  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    errors.push(`${key} still contains a placeholder or weak local value`)
  }
}

for (const key of ["NEXT_PUBLIC_BASE_URL", "STOREFRONT_BASE_URL"]) {
  if (env[key] && !env[key].startsWith("https://")) {
    errors.push(`${key} must use https:// in production`)
  }
}

if (
  env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY &&
  !env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.startsWith("pk_")
) {
  errors.push("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY must start with pk_")
}

for (const key of [
  "JWT_SECRET",
  "COOKIE_SECRET",
  "CONTENT_ADMIN_SECRET",
  "CONTENT_MANAGER_KEY",
  "REVALIDATE_SECRET",
]) {
  if (env[key] && env[key].length < 32) {
    errors.push(`${key} must be at least 32 characters`)
  }
}

if (
  env.CONTENT_ADMIN_SECRET &&
  env.CONTENT_MANAGER_KEY &&
  env.CONTENT_ADMIN_SECRET === env.CONTENT_MANAGER_KEY
) {
  errors.push("CONTENT_ADMIN_SECRET and CONTENT_MANAGER_KEY must be different")
}

for (const key of productionFalseKeys) {
  if (env[key] && env[key] !== "false") {
    errors.push(`${key} must be false in production`)
  }
}

if (env.PRIMARY_DOMAIN && env.SECONDARY_DOMAIN) {
  for (const key of ["NEXT_PUBLIC_BASE_URL", "STOREFRONT_BASE_URL"]) {
    if (!env[key]?.includes(env.PRIMARY_DOMAIN)) {
      errors.push(`${key} should point to PRIMARY_DOMAIN`)
    }
  }
}

for (const domain of ["kidgofun.com", "ttgo.shop"]) {
  if (!env.STORE_CORS?.includes(domain)) {
    errors.push(`STORE_CORS must include ${domain}`)
  }
  if (!env.ADMIN_CORS?.includes(domain)) {
    errors.push(`ADMIN_CORS must include ${domain}`)
  }
  if (!env.AUTH_CORS?.includes(domain)) {
    errors.push(`AUTH_CORS must include ${domain}`)
  }
}

if (errors.length) {
  console.error("Production env validation failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("Production env validation passed.")
