import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import {
  assertContentAdminSecret,
  getSiteContent,
  getSiteContentTranslation,
  listSiteContent,
  upsertSiteContent,
  upsertSiteContentTranslation,
} from "../../../lib/site-content"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const section = req.query.section as string | undefined
  const locale =
    (req.query.content_locale as string | undefined) ||
    (req.query.locale as string | undefined)

  if (section) {
    const record = locale
      ? await getSiteContentTranslation(section, locale)
      : await getSiteContent(section)

    return res.status(200).json({
      section,
      locale: locale ?? null,
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

  const body = (req.body ?? {}) as {
    section?: string
    locale?: string
    data?: unknown
  }

  if (!body.section) {
    return res.status(400).json({ message: "section is required" })
  }

  const record = body.locale
    ? await upsertSiteContentTranslation(
        body.section,
        body.locale,
        body.data ?? {}
      )
    : await upsertSiteContent(body.section, body.data ?? {})

  return res.status(200).json({
    item: record,
  })
}
