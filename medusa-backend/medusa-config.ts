import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'node:path'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const adminSourceDir = path.resolve(process.cwd(), "src/admin").replace(/\\/g, "/")
const isProduction = process.env.NODE_ENV === "production"

function requiredEnv(name: string) {
  const value = process.env[name]

  if (isProduction && !value) {
    throw new Error(`${name} is required in production`)
  }

  return value
}

const jwtSecret = requiredEnv("JWT_SECRET") || "supersecret"
const cookieSecret = requiredEnv("COOKIE_SECRET") || "supersecret"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret,
      cookieSecret,
    }
  },
  admin: {
    vite: () => ({
      resolve: {
        alias: [
          {
            find: /^\/app\/src\/admin\//,
            replacement: `${adminSourceDir}/`,
          },
          {
            find: /^\/src\/admin\//,
            replacement: `${adminSourceDir}/`,
          },
        ],
      },
    }),
  }
})
