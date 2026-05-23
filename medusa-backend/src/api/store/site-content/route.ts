import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import {
  assertContentAdminSecret,
  getSiteContent,
  listSiteContent,
  upsertSiteContent,
} from "../../../lib/site-content"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const section = req.query.section as string | undefined

  if (section) {
    const record = await getSiteContent(section)
    return res.status(200).json({
      section,
      data: record?.data ?? null,
      updated_at: record?.updated_at ?? null,
    })
  }

  const records = await listSiteContent()

  return res.status(200).json({
    items: records,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = req.headers["x-content-admin-secret"]?.toString()

  if (!assertContentAdminSecret(secret)) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const body = (req.body ?? {}) as { section?: string; data?: unknown }

  if (!body.section) {
    return res.status(400).json({ message: "section is required" })
  }

  const record = await upsertSiteContent(body.section, body.data ?? {})

  return res.status(200).json({
    item: record,
  })
}
