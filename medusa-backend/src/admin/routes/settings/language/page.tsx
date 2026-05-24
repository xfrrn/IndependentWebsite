import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Language } from "@medusajs/icons"
import { Button, Container, Heading, RadioGroup, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  getLanguage,
  getStoredLanguage,
  isSupportedLanguage,
  languages,
  persistLanguage,
} from "./language-preferences"

const LanguageSettingsPage = () => {
  const { i18n } = useTranslation()
  const [appliedLanguage, setAppliedLanguage] = useState(getStoredLanguage)
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguage)
  const [isSaving, setIsSaving] = useState(false)

  const currentLanguage = getLanguage(appliedLanguage)

  useEffect(() => {
    if (isSupportedLanguage(i18n.language)) {
      setAppliedLanguage(i18n.language)
      setSelectedLanguage(i18n.language)
    }
  }, [i18n.language])

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    const language = getLanguage(selectedLanguage)

    if (!language) {
      setSelectedLanguage(appliedLanguage)
      return
    }

    setIsSaving(true)

    try {
      await i18n.changeLanguage(language.code)
      persistLanguage(language.code)
      setAppliedLanguage(language.code)
      document.documentElement.dir = language.ltr ? "ltr" : "rtl"
      toast.success("Language preference saved")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading>Language</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Choose the language used in Medusa Admin.
          </Text>
        </div>
        <Button disabled={isSaving} onClick={handleSave} size="small">
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <RadioGroup
        className="grid grid-cols-1 gap-3 p-6 md:grid-cols-2 xl:grid-cols-3"
        onValueChange={(value) => {
          if (isSupportedLanguage(value)) {
            setSelectedLanguage(value)
          }
        }}
        value={selectedLanguage}
      >
        {languages.map((language) => {
          const isActive = language.code === appliedLanguage
          const isUnsaved =
            selectedLanguage !== appliedLanguage && language.code === selectedLanguage

          return (
            <label
              className="border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover flex cursor-pointer items-start gap-x-3 rounded-lg border p-4"
              htmlFor={`language-${language.code}`}
              key={language.code}
            >
              <RadioGroup.Item
                className="mt-1"
                id={`language-${language.code}`}
                value={language.code}
              />
              <div className="flex flex-1 flex-col gap-y-1">
                <div className="flex items-center justify-between gap-x-2">
                  <Text weight="plus">{language.nativeName}</Text>
                  {isActive && (
                    <Text className="text-ui-fg-interactive" size="xsmall">
                      Active
                    </Text>
                  )}
                  {isUnsaved && (
                    <Text className="text-ui-fg-subtle" size="xsmall">
                      Unsaved
                    </Text>
                  )}
                </div>
                <Text className="text-ui-fg-subtle" size="small">
                  {language.label}
                </Text>
              </div>
            </label>
          )
        })}
      </RadioGroup>

      <div className="px-6 py-4">
        <Text className="text-ui-fg-subtle" size="small">
          Current language: {currentLanguage?.nativeName ?? appliedLanguage}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Language",
  icon: Language,
  rank: 950,
})

export default LanguageSettingsPage
