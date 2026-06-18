import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Language } from "@medusajs/icons"
import { Button, Container, Heading, Input, Select, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

const locales = [
  { value: "en-US", label: "English" },
  { value: "ar-SA", label: "العربية" },
  { value: "zh-CN", label: "中文" },
] as const

type StorefrontContentConfig = {
  storefront_base_url: string
  default_country_code: string
}

function cleanBaseUrl(value: string) {
  return value.replace(/\/+$/, "")
}

const StorefrontContentPage = () => {
  const [config, setConfig] = useState<StorefrontContentConfig>({
    storefront_base_url: "http://localhost:8000",
    default_country_code: "dk",
  })
  const [countryCode, setCountryCode] = useState("dk")
  const [locale, setLocale] = useState<(typeof locales)[number]["value"]>(
    "en-US"
  )

  useEffect(() => {
    fetch("/admin/storefront-content-config")
      .then((response) => response.json())
      .then((payload: StorefrontContentConfig) => {
        setConfig(payload)
        setCountryCode(payload.default_country_code || "dk")
      })
      .catch(() => {
        // Keep local defaults if the helper endpoint is unavailable.
      })
  }, [])

  const editorUrl = useMemo(() => {
    const country = countryCode.trim().toLowerCase() || "dk"
    const baseUrl = cleanBaseUrl(config.storefront_base_url)
    return `${baseUrl}/${country}/content-manager?locale=${encodeURIComponent(
      locale
    )}`
  }, [config.storefront_base_url, countryCode, locale])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading>Storefront Content</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Open the storefront content editor for a country and language.
          </Text>
        </div>
        <Button asChild size="small">
          <a href={editorUrl} rel="noreferrer" target="_blank">
            Open editor
          </a>
        </Button>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        <label className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Country code
          </Text>
          <Input
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            placeholder="dk"
          />
        </label>

        <label className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Language
          </Text>
          <Select
            value={locale}
            onValueChange={(value) =>
              setLocale(value as (typeof locales)[number]["value"])
            }
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {locales.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </label>
      </div>

      <div className="px-6 py-4">
        <Text className="text-ui-fg-subtle break-all" size="small">
          {editorUrl}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Storefront Content",
  icon: Language,
  rank: 940,
})

export default StorefrontContentPage
