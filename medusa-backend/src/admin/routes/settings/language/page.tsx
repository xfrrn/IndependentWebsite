import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Language } from "@medusajs/icons"
import { Button, Container, Heading, RadioGroup, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

const LANGUAGE_STORAGE_KEY = "lng"

const languages = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "zhCN", label: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zhTW", label: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "de", label: "German", nativeName: "Deutsch" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "it", label: "Italian", nativeName: "Italiano" },
  { code: "ja", label: "Japanese", nativeName: "日本語" },
  { code: "ko", label: "Korean", nativeName: "한국어" },
  { code: "nl", label: "Dutch", nativeName: "Nederlands" },
  { code: "pl", label: "Polish", nativeName: "Polski" },
  { code: "ptBR", label: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "ptPT", label: "Portuguese (Portugal)", nativeName: "Português (Portugal)" },
  { code: "ru", label: "Russian", nativeName: "Русский" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt" },
]

const getStoredLanguage = () => {
  if (typeof window === "undefined") {
    return "en"
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en"
}

const persistLanguage = (language: string) => {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${language};path=/;max-age=31536000;samesite=lax`
}

const LanguageSettingsPage = () => {
  const { i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguage)

  const currentLanguage = useMemo(() => {
    return languages.find((language) => language.code === selectedLanguage)
  }, [selectedLanguage])

  useEffect(() => {
    if (i18n.language && languages.some((language) => language.code === i18n.language)) {
      setSelectedLanguage(i18n.language)
    }
  }, [i18n.language])

  const handleSave = async () => {
    persistLanguage(selectedLanguage)
    await i18n.changeLanguage(selectedLanguage)

    document.documentElement.dir =
      selectedLanguage === "ar" || selectedLanguage === "fa" || selectedLanguage === "he"
        ? "rtl"
        : "ltr"

    toast.success("Admin language updated")
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading>Admin language</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Choose the language used by the Medusa Admin interface.
          </Text>
        </div>
        <Button size="small" onClick={handleSave}>
          Save
        </Button>
      </div>

      <div className="px-6 py-4">
        <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {languages.map((language) => {
              const isSelected = language.code === selectedLanguage

              return (
                <label
                  key={language.code}
                  className="shadow-borders-base bg-ui-bg-base hover:bg-ui-bg-base-hover flex cursor-pointer items-center gap-x-3 rounded-md px-3 py-2"
                >
                  <RadioGroup.Item value={language.code} />
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      {language.nativeName}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {language.label}
                    </Text>
                  </div>
                  {isSelected && (
                    <Text size="xsmall" className="text-ui-fg-subtle ml-auto">
                      Active
                    </Text>
                  )}
                </label>
              )
            })}
          </div>
        </RadioGroup>
      </div>

      {currentLanguage && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Current selection: {currentLanguage.nativeName}
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Language",
  icon: Language,
  rank: 950,
})

export default LanguageSettingsPage
