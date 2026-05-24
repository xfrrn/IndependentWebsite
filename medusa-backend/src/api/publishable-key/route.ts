import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (process.env.ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT !== "true") {
    return res.sendStatus(404)
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "api_key",
    fields: ["token"],
    filters: {
      type: "publishable",
    },
  })

  const publishableKey = data?.[0]?.token

  if (!publishableKey) {
    return res.status(404).json({
      message: "No publishable API key found. Run the backend seed script first.",
    })
  }

  res.json({ publishable_key: publishableKey })
}
