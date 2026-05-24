import {
  DEFAULT_LANGUAGE,
  getLanguage,
  getStoredLanguage,
  isSupportedLanguage,
  languages,
  persistLanguage,
} from "../language-preferences"

describe("admin language preferences", () => {
  const originalWindow = global.window
  const originalDocument = global.document

  afterEach(() => {
    Object.defineProperty(global, "window", {
      configurable: true,
      value: originalWindow,
    })
    Object.defineProperty(global, "document", {
      configurable: true,
      value: originalDocument,
    })
  })

  it("includes all bundled Medusa Admin languages", () => {
    expect(languages.map((language) => language.code)).toEqual([
      "bs",
      "bg",
      "en",
      "es",
      "el",
      "de",
      "fr",
      "he",
      "hu",
      "it",
      "ja",
      "pl",
      "ptBR",
      "ptPT",
      "tr",
      "th",
      "uk",
      "ro",
      "mk",
      "mn",
      "ar",
      "zhCN",
      "fa",
      "cs",
      "ru",
      "lt",
      "vi",
      "id",
      "ko",
      "nl",
      "zhTW",
    ])
  })

  it("accepts supported language codes and rejects unknown values", () => {
    expect(isSupportedLanguage("ar")).toBe(true)
    expect(isSupportedLanguage("zh-CN")).toBe(false)
    expect(isSupportedLanguage(null)).toBe(false)
  })

  it("returns language metadata including text direction", () => {
    expect(getLanguage("he")?.ltr).toBe(false)
    expect(getLanguage("de")?.nativeName).toBe("Deutsch")
    expect(getLanguage("zh-CN")).toBeUndefined()
  })

  it("falls back to English when stored language is invalid", () => {
    Object.defineProperty(global, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => "zh-CN",
        },
      },
    })

    expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE)
  })

  it("falls back to English when localStorage read throws", () => {
    Object.defineProperty(global, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => {
            throw new Error("storage blocked")
          },
        },
      },
    })

    expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE)
  })

  it("writes the cookie even when localStorage write throws", () => {
    const documentStub = { cookie: "" }

    Object.defineProperty(global, "window", {
      configurable: true,
      value: {
        localStorage: {
          setItem: () => {
            throw new Error("storage blocked")
          },
        },
      },
    })
    Object.defineProperty(global, "document", {
      configurable: true,
      value: documentStub,
    })

    persistLanguage("ar")

    expect(documentStub.cookie).toBe("lng=ar;path=/;max-age=31536000;samesite=lax")
  })
})
