import Link from "next/link"
import { redirect } from "next/navigation"

import {
  AGE_HIGHLIGHTS,
  CONTACT_IMAGES_CONTENT,
  FEATURED_PRODUCTS,
  FOOTER_CONTENT,
  HEADER_CONTENT,
  HERO_CONTENT,
  HERO_IMAGES,
  NAV_CONTENT,
  type ContactImagesContent,
} from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import { normalizeLocale, SUPPORTED_LOCALES } from "@lib/data/supported-locales"
import { isContentManagerAuthorized } from "@lib/util/content-manager-auth"

import {
  saveAgeHighlights,
  saveFeaturedProducts,
  saveFooterContent,
  saveHeaderContent,
  saveHeroContent,
  saveNavContent,
} from "./actions"

type HeroEditorContent = typeof HERO_CONTENT & {
  images?: typeof HERO_IMAGES
}

const MAX_HERO_IMAGES = 5

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#3f3422]">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="h-12 rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 text-sm text-[#1f1a12] outline-none transition duration-300 ease-out hover:border-[color:var(--accent)]/55 focus:border-[color:var(--accent)]"
      />
    </label>
  )
}

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string
  name: string
  defaultValue: string
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#3f3422]">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 py-3 text-sm text-[#1f1a12] outline-none transition duration-300 ease-out hover:border-[color:var(--accent)]/55 focus:border-[color:var(--accent)]"
      />
    </label>
  )
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 py-3 text-sm font-medium text-[#3f3422]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[color:var(--accent)]"
      />
      <span>{label}</span>
    </label>
  )
}

function FileField({
  label,
  name,
  currentValue,
}: {
  label: string
  name: string
  currentValue?: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#3f3422]">{label}</span>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 py-3 text-sm text-[#1f1a12] outline-none transition duration-300 ease-out file:mr-4 file:rounded-full file:border-0 file:bg-[#f5e7b8] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#5c4612] hover:border-[color:var(--accent)]/55 focus:border-[color:var(--accent)]"
      />
      {currentValue ? (
        <span className="break-all text-xs text-[#5f5138]">
          当前：{currentValue}
        </span>
      ) : null}
    </label>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-6 shadow-[0_22px_55px_-38px_rgba(92,72,45,0.2)] md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text-strong)]">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-body)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

function SaveButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--accent-strong)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#dfead8]"
    >
      {label}
    </button>
  )
}

function StatusBanner({ error, saved }: { error?: string; saved?: string }) {
  if (!error && !saved) {
    return null
  }

  const isError = Boolean(error)

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-[color:var(--accent)]/35 bg-[var(--accent-soft)] text-[color:var(--accent-strong)]"}`}
    >
      {isError ? "无法继续，请重新登录后台。" : `已保存：${saved}`}
    </div>
  )
}

function getContactImageKey(link: { href?: string; label?: string }) {
  const value = `${link.href || ""} ${link.label || ""}`.toLowerCase()

  if (value.includes("wechat") || value.includes("微信")) {
    return "wechat" as const
  }

  if (value.includes("whatsapp")) {
    return "whatsapp" as const
  }

  return null
}

function applySharedContactImages<T extends typeof HEADER_CONTENT>(
  headerContent: T,
  contactImages: ContactImagesContent
): T {
  return {
    ...headerContent,
    links: headerContent.links.map((link) => {
      const key = getContactImageKey(link)
      const image = key ? contactImages[key] : null

      if (!image?.src) {
        return link
      }

      return {
        ...link,
        modalImageSrc: image.src,
        modalImageAlt: image.alt || link.modalImageAlt,
      }
    }),
  } as T
}

export default async function ContentManagerPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ error?: string; locale?: string; saved?: string }>
}) {
  const [{ countryCode }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const currentLocale = normalizeLocale(searchParams.locale)

  if (!(await isContentManagerAuthorized())) {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/content-manager?locale=${currentLocale}`)}`
    )
  }

  const [
    headerContent,
    navContent,
    heroContent,
    featuredProducts,
    ageHighlights,
    footerContent,
    contactImages,
  ] = await Promise.all([
    getLocalizedHomeContentSection(
      "header_content",
      HEADER_CONTENT,
      currentLocale
    ),
    getLocalizedHomeContentSection("nav_content", NAV_CONTENT, currentLocale),
    getLocalizedHomeContentSection<HeroEditorContent>(
      "hero_content",
      { ...HERO_CONTENT, images: HERO_IMAGES },
      currentLocale
    ),
    getLocalizedHomeContentSection(
      "featured_products",
      FEATURED_PRODUCTS,
      currentLocale
    ),
    getLocalizedHomeContentSection(
      "age_highlights",
      AGE_HIGHLIGHTS,
      currentLocale
    ),
    getLocalizedHomeContentSection(
      "footer_content",
      FOOTER_CONTENT,
      currentLocale
    ),
    getSiteContentSection<ContactImagesContent>(
      "contact_images",
      CONTACT_IMAGES_CONTENT
    ),
  ])
  const headerContentWithSharedImages = applySharedContactImages(
    headerContent,
    contactImages
  )
  const heroImages = Array.from({ length: MAX_HERO_IMAGES }, (_, index) => {
    return heroContent.images?.[index] ?? HERO_IMAGES[index] ?? { src: "", alt: "" }
  })

  return (
    <main className="bg-[var(--bg-canvas)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-6 shadow-[0_22px_55px_-38px_rgba(92,72,45,0.2)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
                内容管理
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text-strong)]">
                首页内容编辑
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-body)]">
                这里只保留当前 Lite 首页实际使用的内容。商品、分类名称和分类图片请在后台对应的商品/分类页面编辑。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] px-5 py-3 text-sm font-semibold text-[color:var(--text-strong)] transition duration-300 ease-out hover:border-[color:var(--accent)]/35 hover:bg-[var(--accent-soft)]"
              >
                查看首页
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-transparent px-5 py-3 text-sm font-semibold text-[color:var(--text-body)] transition duration-300 ease-out hover:border-[color:var(--accent)]/35 hover:bg-[rgba(255,250,242,0.72)]"
              >
                返回后台
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <StatusBanner
              saved={searchParams.saved}
              error={searchParams.error}
            />
          </div>
        </div>

        <SectionCard
          title="语言"
          description="选择要编辑的前台语言，不同语言会分别保存。"
        >
          <div className="flex flex-wrap gap-3">
            {SUPPORTED_LOCALES.map((locale) => (
              <Link
                key={locale.code}
                href={`/content-manager?locale=${locale.code}`}
                className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition duration-300 ease-out ${
                  currentLocale === locale.code
                    ? "border-[color:var(--accent)] bg-[var(--accent-soft)] text-[color:var(--accent-strong)]"
                    : "border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] text-[color:var(--text-strong)] hover:border-[color:var(--accent)]/35 hover:bg-[var(--accent-soft)]"
                }`}
              >
                {locale.label}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="页头"
          description="控制顶部品牌名、搜索框、移动菜单按钮和联系方式二维码。"
        >
          <form
            action={saveHeaderContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="品牌名称"
                name="brandName"
                defaultValue={headerContentWithSharedImages.brandName}
              />
              <Field
                label="搜索按钮无障碍标签"
                name="searchAriaLabel"
                defaultValue={headerContentWithSharedImages.searchAriaLabel}
              />
              <Field
                label="搜索框占位文案"
                name="searchPlaceholder"
                defaultValue={headerContentWithSharedImages.searchPlaceholder}
              />
              <Field
                label="移动端菜单按钮文案"
                name="mobileMenuLabel"
                defaultValue={headerContentWithSharedImages.mobileMenuLabel}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {headerContentWithSharedImages.links.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    联系方式 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="标题"
                      name={`links.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="详情"
                      name={`links.${index}.detail`}
                      defaultValue={item.detail}
                    />
                    <Field
                      label="链接"
                      name={`links.${index}.href`}
                      defaultValue={item.href}
                    />
                    <Field
                      label="二维码图片 URL"
                      name={`links.${index}.modalImageSrc`}
                      defaultValue={item.modalImageSrc || ""}
                    />
                    <FileField
                      label="上传二维码图片"
                      name={`links.${index}.modalImageFile`}
                      currentValue={item.modalImageSrc || ""}
                    />
                    <Field
                      label="二维码图片替代文本"
                      name={`links.${index}.modalImageAlt`}
                      defaultValue={item.modalImageAlt || ""}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存页头" />
          </form>
        </SectionCard>

        <SectionCard
          title="导航"
          description="当前首页导航只使用这些标签；分类下拉内容来自后台分类，不在这里编辑。"
        >
          <form
            action={saveNavContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field
                label="移动端浏览文案"
                name="mobileBrowseLabel"
                defaultValue={navContent.mobileBrowseLabel}
              />
              <Field
                label="移动端关闭文案"
                name="mobileCloseLabel"
                defaultValue={navContent.mobileCloseLabel}
              />
              <Field
                label="右侧短文案"
                name="exploreLabel"
                defaultValue={navContent.exploreLabel}
              />
              <Field
                label="大菜单介绍前缀"
                name="megaMenuIntroLabelPrefix"
                defaultValue={navContent.megaMenuIntroLabelPrefix}
              />
              <Field
                label="移动端跳转前缀"
                name="mobileGoToPrefix"
                defaultValue={navContent.mobileGoToPrefix}
              />
              <TextareaField
                label="大菜单说明"
                name="megaMenuIntroDescription"
                defaultValue={navContent.megaMenuIntroDescription}
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {navContent.items.slice(0, 2).map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    导航项 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="标题"
                      name={`items.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="链接"
                      name={`items.${index}.href`}
                      defaultValue={item.href ?? ""}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存导航" />
          </form>
        </SectionCard>

        <SectionCard
          title="首屏轮播图"
          description="首页首屏现在是纯展示横屏轮播，最多 5 张图片。可以填写 URL，也可以上传图片。"
        >
          <form
            action={saveHeroContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {heroImages.map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    首屏图片 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="图片 URL"
                      name={`images.${index}.src`}
                      defaultValue={image.src}
                    />
                    <Field
                      label="图片替代文本"
                      name={`images.${index}.alt`}
                      defaultValue={image.alt}
                    />
                    <FileField
                      label="上传图片"
                      name={`images.${index}.file`}
                      currentValue={image.src}
                    />
                  </div>
                </div>
              ))}
            </div>
            <SaveButton label="保存首屏" />
          </form>
        </SectionCard>

        <SectionCard
          title="首页商品区块"
          description="控制首页商品网格上方的标题、副标题和商品名称/价格显示开关。"
        >
          <form
            action={saveFeaturedProducts.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="眉题"
                name="eyebrow"
                defaultValue={featuredProducts.eyebrow}
              />
              <Field
                label="标题"
                name="title"
                defaultValue={featuredProducts.title}
              />
              <TextareaField
                label="副标题"
                name="subtitle"
                defaultValue={featuredProducts.subtitle}
                rows={2}
              />
              <Field
                label="展示策略"
                name="strategy"
                defaultValue={featuredProducts.strategy}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="显示商品名称"
                name="showProductNames"
                defaultChecked={
                  featuredProducts.showProductNames ??
                  FEATURED_PRODUCTS.showProductNames
                }
              />
              <CheckboxField
                label="显示商品价格"
                name="showProductPrices"
                defaultChecked={
                  featuredProducts.showProductPrices ??
                  FEATURED_PRODUCTS.showProductPrices
                }
              />
            </div>
            <SaveButton label="保存商品区块" />
          </form>
        </SectionCard>

        <SectionCard
          title="分类圆形入口区块"
          description="首页圆形入口的具体分类、名称和图片来自后台分类；这里仅编辑区块标题。"
        >
          <form
            action={saveAgeHighlights.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="眉题"
                name="eyebrow"
                defaultValue={ageHighlights.eyebrow}
              />
              <Field
                label="标题"
                name="title"
                defaultValue={ageHighlights.title}
              />
              <TextareaField
                label="副标题"
                name="subtitle"
                defaultValue={ageHighlights.subtitle}
                rows={2}
              />
            </div>
            <SaveButton label="保存分类入口区块" />
          </form>
        </SectionCard>

        <SectionCard
          title="页脚"
          description="控制每个页面底部显示的品牌、网站、联系方式和社交链接。"
        >
          <form
            action={saveFooterContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="品牌名称"
                name="brandName"
                defaultValue={footerContent.brandName}
              />
              <Field
                label="网站文案"
                name="websiteLabel"
                defaultValue={footerContent.websiteLabel}
              />
              <Field
                label="网站链接"
                name="websiteHref"
                defaultValue={footerContent.websiteHref}
              />
              <Field
                label="联系方式文案"
                name="contactLabel"
                defaultValue={footerContent.contactLabel}
              />
              <Field
                label="联系方式链接"
                name="contactHref"
                defaultValue={footerContent.contactHref}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {footerContent.socialLinks.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    社交链接 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="标题"
                      name={`socialLinks.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="链接"
                      name={`socialLinks.${index}.href`}
                      defaultValue={item.href}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存页脚" />
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
