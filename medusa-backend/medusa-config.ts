import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'node:path'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const adminSourceDir = path.resolve(process.cwd(), "src/admin").replace(/\\/g, "/")

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
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
