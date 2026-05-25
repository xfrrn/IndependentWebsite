import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.status(200).json({
    storefront_base_url:
      process.env.STOREFRONT_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:8000",
    default_country_code: process.env.DEFAULT_STORE_COUNTRY_CODE || "dk",
  })
}
