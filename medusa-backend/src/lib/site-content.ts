import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export type SiteContentRecord = {
  section: string
  data: unknown
  updated_at: string
}

export type SiteContentTranslationRecord = SiteContentRecord & {
  locale: string
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content_blocks (
      section TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content_translations (
      section TEXT NOT NULL,
      locale TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (section, locale)
    )
  `)
}

export async function listSiteContent() {
  await ensureTable()

  const { rows } = await pool.query<SiteContentRecord>(
    `SELECT section, data, updated_at
     FROM site_content_blocks
     ORDER BY section ASC`
  )

  return rows
}

export async function getSiteContent(section: string) {
  await ensureTable()

  const { rows } = await pool.query<SiteContentRecord>(
    `SELECT section, data, updated_at
     FROM site_content_blocks
     WHERE section = $1
     LIMIT 1`,
    [section]
  )

  return rows[0] ?? null
}

export async function getSiteContentTranslation(
  section: string,
  locale: string
) {
  await ensureTable()

  const { rows } = await pool.query<SiteContentTranslationRecord>(
    `SELECT section, locale, data, updated_at
     FROM site_content_translations
     WHERE section = $1 AND locale = $2
     LIMIT 1`,
    [section, locale]
  )

  return rows[0] ?? null
}

export async function upsertSiteContent(section: string, data: unknown) {
  await ensureTable()

  const { rows } = await pool.query<SiteContentRecord>(
    `INSERT INTO site_content_blocks (section, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (section)
     DO UPDATE SET
       data = EXCLUDED.data,
       updated_at = NOW()
     RETURNING section, data, updated_at`,
    [section, JSON.stringify(data)]
  )

  return rows[0]
}

export async function upsertSiteContentTranslation(
  section: string,
  locale: string,
  data: unknown
) {
  await ensureTable()

  const { rows } = await pool.query<SiteContentTranslationRecord>(
    `INSERT INTO site_content_translations (section, locale, data)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (section, locale)
     DO UPDATE SET
       data = EXCLUDED.data,
       updated_at = NOW()
     RETURNING section, locale, data, updated_at`,
    [section, locale, JSON.stringify(data)]
  )

  return rows[0]
}

export function assertContentAdminSecret(secret?: string | null) {
  const expected = process.env.CONTENT_ADMIN_SECRET

  if (!expected) {
    return process.env.NODE_ENV !== "production"
  }

  return secret === expected
}
