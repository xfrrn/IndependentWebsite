import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"

type TrafficCountRow = {
  count: bigint | number
}

export type TrafficTopPage = {
  path: string
  views: number
}

export type TrafficOverview = {
  today: number
  last7Days: number
  total: number
  topPages: TrafficTopPage[]
}

let trafficTablePromise: Promise<void> | null = null

export async function ensureTrafficTable() {
  if (trafficTablePromise) {
    return trafficTablePromise
  }

  trafficTablePromise = ensureTrafficTableOnce()
  return trafficTablePromise
}

async function ensureTrafficTableOnce() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS traffic_events (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      title TEXT,
      referrer TEXT,
      user_agent TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS traffic_events_created_at_idx
      ON traffic_events (created_at)
  `

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS traffic_events_path_idx
      ON traffic_events (path)
  `
}

function toNumber(value: bigint | number | null | undefined) {
  return Number(value ?? 0)
}

async function countSince(date?: Date) {
  const rows = date
    ? await prisma.$queryRaw<TrafficCountRow[]>`
        SELECT COUNT(*)::bigint AS count
        FROM traffic_events
        WHERE created_at >= ${date}
      `
    : await prisma.$queryRaw<TrafficCountRow[]>`
        SELECT COUNT(*)::bigint AS count
        FROM traffic_events
      `

  return toNumber(rows[0]?.count)
}

export async function recordPageView(input: {
  path: string
  title?: string | null
  referrer?: string | null
  userAgent?: string | null
  ip?: string | null
}) {
  await prisma.trafficEvent.create({
    data: {
      id: randomUUID(),
      path: input.path,
      title: input.title ?? null,
      referrer: input.referrer ?? null,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
    },
  })
}

export async function getTrafficOverview(): Promise<TrafficOverview> {
  await ensureTrafficTable()

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const last7DaysStart = new Date(now)
  last7DaysStart.setDate(last7DaysStart.getDate() - 6)
  last7DaysStart.setHours(0, 0, 0, 0)

  const [today, last7Days, total, topPageRows] = await Promise.all([
    countSince(todayStart),
    countSince(last7DaysStart),
    countSince(),
    prisma.$queryRaw<Array<{ path: string; views: bigint | number }>>`
      SELECT path, COUNT(*)::bigint AS views
      FROM traffic_events
      GROUP BY path
      ORDER BY views DESC
      LIMIT 5
    `,
  ])

  return {
    today,
    last7Days,
    total,
    topPages: topPageRows.map((row) => ({
      path: row.path,
      views: toNumber(row.views),
    })),
  }
}
