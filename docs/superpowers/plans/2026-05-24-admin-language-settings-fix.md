# Admin Language Settings Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Medusa Admin language settings page so it supports all bundled Admin locales, handles invalid/storage-failing preferences safely, and avoids misleading unsaved/overlapping save state.

**Architecture:** Keep the fix focused in `medusa-backend/src/admin/routes/settings/language/page.tsx`. Replace the incomplete local language list with a full supported-locale table that includes direction metadata, validate persisted values against that table, and separate pending selection from the applied language.

**Tech Stack:** Medusa Admin extension route, React, `react-i18next`, Medusa UI components, browser `localStorage` and cookie persistence.

---

### Task 1: Add complete locale metadata and safe preference helpers

**Files:**
- Modify: `medusa-backend/src/admin/routes/settings/language/page.tsx:7-39`

- [ ] **Step 1: Replace the incomplete language list with complete metadata**

Replace the current `languages` constant with:

```tsx
const DEFAULT_LANGUAGE = "en"
const LANGUAGE_STORAGE_KEY = "lng"

const languages = [
  { code: "bs", label: "Bosnian", nativeName: "Bosanski", ltr: true },
  { code: "bg", label: "Bulgarian", nativeName: "Български", ltr: true },
  { code: "en", label: "English", nativeName: "English", ltr: true },
  { code: "es", label: "Spanish", nativeName: "Español", ltr: true },
  { code: "el", label: "Greek", nativeName: "Ελληνικά", ltr: true },
  { code: "de", label: "German", nativeName: "Deutsch", ltr: true },
  { code: "fr", label: "French", nativeName: "Français", ltr: true },
  { code: "he", label: "Hebrew", nativeName: "עברית", ltr: false },
  { code: "hu", label: "Hungarian", nativeName: "Magyar", ltr: true },
  { code: "it", label: "Italian", nativeName: "Italiano", ltr: true },
  { code: "ja", label: "Japanese", nativeName: "日本語", ltr: true },
  { code: "pl", label: "Polish", nativeName: "Polski", ltr: true },
  { code: "ptBR", label: "Portuguese (Brazil)", nativeName: "Português (Brasil)", ltr: true },
  { code: "ptPT", label: "Portuguese (Portugal)", nativeName: "Português (Portugal)", ltr: true },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", ltr: true },
  { code: "th", label: "Thai", nativeName: "ไทย", ltr: true },
  { code: "uk", label: "Ukrainian", nativeName: "Українська", ltr: true },
  { code: "ro", label: "Romanian", nativeName: "Română", ltr: true },
  { code: "mk", label: "Macedonian", nativeName: "Македонски", ltr: true },
  { code: "mn", label: "Mongolian", nativeName: "Монгол", ltr: true },
  { code: "ar", label: "Arabic", nativeName: "العربية", ltr: false },
  { code: "zhCN", label: "Chinese (Simplified)", nativeName: "简体中文", ltr: true },
  { code: "fa", label: "Persian", nativeName: "فارسی", ltr: false },
  { code: "cs", label: "Czech", nativeName: "Čeština", ltr: true },
  { code: "ru", label: "Russian", nativeName: "Русский", ltr: true },
  { code: "lt", label: "Lithuanian", nativeName: "Lietuviškai", ltr: true },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", ltr: true },
  { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia", ltr: true },
  { code: "ko", label: "Korean", nativeName: "한국어", ltr: true },
  { code: "nl", label: "Dutch", nativeName: "Nederlands", ltr: true },
  { code: "zhTW", label: "Chinese (Traditional)", nativeName: "繁體中文(臺灣)", ltr: true },
] as const

type LanguageCode = (typeof languages)[number]["code"]

const isSupportedLanguage = (language: string | null | undefined): language is LanguageCode => {
  return languages.some((supportedLanguage) => supportedLanguage.code === language)
}

const getLanguage = (language: string | null | undefined) => {
  return languages.find((supportedLanguage) => supportedLanguage.code === language)
}
```

- [ ] **Step 2: Replace `getStoredLanguage` with a safe validated helper**

Use this implementation:

```tsx
const getStoredLanguage = (): LanguageCode => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    if (isSupportedLanguage(storedLanguage)) {
      return storedLanguage
    }
  } catch {}

  return DEFAULT_LANGUAGE
}
```

- [ ] **Step 3: Replace `persistLanguage` with a storage-safe helper**

Use this implementation:

```tsx
const persistLanguage = (language: LanguageCode) => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {}

  document.cookie = `${LANGUAGE_STORAGE_KEY}=${language};path=/;max-age=31536000;samesite=lax`
}
```

- [ ] **Step 4: Run a type/build check**

Run:

```bash
cd medusa-backend && npm run build
```

Expected: build should either pass or fail only on unrelated existing project issues. If it fails because of the edited file, fix that before continuing.

### Task 2: Separate applied language from pending selection

**Files:**
- Modify: `medusa-backend/src/admin/routes/settings/language/page.tsx:41-65`

- [ ] **Step 1: Add applied/pending state and saving state**

Replace the component state block with:

```tsx
const LanguageSettingsPage = () => {
  const { i18n } = useTranslation()
  const [appliedLanguage, setAppliedLanguage] = useState<LanguageCode>(getStoredLanguage)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(getStoredLanguage)
  const [isSaving, setIsSaving] = useState(false)

  const currentLanguage = useMemo(() => {
    return getLanguage(appliedLanguage)
  }, [appliedLanguage])
```

- [ ] **Step 2: Sync only supported i18n language values**

Replace the existing `useEffect` with:

```tsx
  useEffect(() => {
    if (isSupportedLanguage(i18n.language)) {
      setAppliedLanguage(i18n.language)
      setSelectedLanguage(i18n.language)
    }
  }, [i18n.language])
```

- [ ] **Step 3: Replace `handleSave` with race-safe save logic**

Use this implementation:

```tsx
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
      toast.success("Admin language updated")
    } finally {
      setIsSaving(false)
    }
  }
```

- [ ] **Step 4: Run a type/build check**

Run:

```bash
cd medusa-backend && npm run build
```

Expected: build should either pass or fail only on unrelated existing project issues. If it fails because of the edited file, fix that before continuing.

### Task 3: Update UI state labels and save controls

**Files:**
- Modify: `medusa-backend/src/admin/routes/settings/language/page.tsx:67-119`

- [ ] **Step 1: Disable Save while saving**

Replace the button with:

```tsx
        <Button size="small" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
```

- [ ] **Step 2: Ensure the radio only receives supported typed values**

Replace the `RadioGroup` opening tag with:

```tsx
        <RadioGroup
          value={selectedLanguage}
          onValueChange={(value) => {
            if (isSupportedLanguage(value)) {
              setSelectedLanguage(value)
            }
          }}
        >
```

- [ ] **Step 3: Change active marker to applied language and show pending state separately**

Inside the `languages.map`, replace the selection calculations and marker with:

```tsx
              const isApplied = language.code === appliedLanguage
              const isPending = language.code === selectedLanguage && selectedLanguage !== appliedLanguage
```

Then replace the current marker block with:

```tsx
                  {isApplied && (
                    <Text size="xsmall" className="text-ui-fg-subtle ml-auto">
                      Active
                    </Text>
                  )}
                  {isPending && (
                    <Text size="xsmall" className="text-ui-fg-subtle ml-auto">
                      Unsaved
                    </Text>
                  )}
```

- [ ] **Step 4: Keep current selection tied to applied language**

Keep the current selection footer as:

```tsx
      {currentLanguage && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Current selection: {currentLanguage.nativeName}
          </Text>
        </div>
      )}
```

- [ ] **Step 5: Run a type/build check**

Run:

```bash
cd medusa-backend && npm run build
```

Expected: build should pass or only fail on unrelated existing project issues.

### Task 4: Final verification

**Files:**
- Verify: `medusa-backend/src/admin/routes/settings/language/page.tsx`

- [ ] **Step 1: Check the final diff**

Run:

```bash
git diff -- medusa-backend/src/admin/routes/settings/language/page.tsx
```

Expected: only the language settings page is modified, with no unrelated formatting churn.

- [ ] **Step 2: Run final backend build**

Run:

```bash
cd medusa-backend && npm run build
```

Expected: build passes. If it fails due to admin bundling/type errors in this page, fix those errors.

- [ ] **Step 3: Optional manual check in Admin**

Run the Docker stack if needed:

```bash
docker compose up -d --build
```

Open `http://localhost:9000/app/settings/language` and verify:

- Arabic, Hebrew, Bulgarian, Thai, and Ukrainian appear in the list.
- Selecting a language shows `Unsaved`, not `Active`, before clicking Save.
- Clicking Save changes `Active` to the saved language.
- Clicking Save repeatedly while saving does not start overlapping saves.
- Invalid existing `localStorage.lng` falls back to English instead of showing no selection.

### Self-review

- Spec coverage: The plan covers complete locale support, validated stored language, safe localStorage access, applied-vs-pending state, save race prevention, and direction metadata.
- Placeholder scan: No placeholders remain.
- Type consistency: `LanguageCode`, `isSupportedLanguage`, `getLanguage`, `appliedLanguage`, and `selectedLanguage` are used consistently across tasks.
