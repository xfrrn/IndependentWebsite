import Link from "next/link"
import { redirect } from "next/navigation"

import {
  AGE_HIGHLIGHTS,
  AGE_PAGE_CONTENT,
  CATEGORY_PAGE_CONTENT,
  CONTACT_IMAGES_CONTENT,
  FOOTER_CONTENT,
  HEADER_CONTENT,
  HERO_CONTENT,
  NAV_CONTENT,
  FEATURED_PRODUCTS,
  PRODUCTS_PAGE_CONTENT,
  PRODUCT_UI_CONTENT,
  type ContactImagesContent,
} from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import { normalizeLocale, SUPPORTED_LOCALES } from "@lib/data/supported-locales"
import { isContentManagerAuthorized } from "@lib/util/content-manager-auth"

import {
  saveAgePageContent,
  saveAgeHighlights,
  saveCategoryPageContent,
  saveFooterContent,
  saveFeaturedProducts,
  saveHeaderContent,
  saveHeroContent,
  saveNavContent,
  saveProductsPageContent,
  saveProductUiContent,
} from "./actions"

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
      <span className="text-sm font-medium text-[#3f3422]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="h-12 rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 text-sm text-[#1f1a12] outline-none transition duration-300 ease-out placeholder:text-[#7b6b53] hover:border-[color:var(--accent)]/55 focus:border-[color:var(--accent)]"
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
      <span className="text-sm font-medium text-[#3f3422]">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="rounded-2xl border border-[#d8c8a7] bg-[#fffaf2] px-4 py-3 text-sm text-[#1f1a12] outline-none transition duration-300 ease-out placeholder:text-[#7b6b53] hover:border-[color:var(--accent)]/55 focus:border-[color:var(--accent)]"
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
      <span className="text-sm font-medium text-[#3f3422]">
        {label}
      </span>
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

function StatusBanner({
  error,
  saved,
}: {
  error?: string
  saved?: string
}) {
  if (!error && !saved) {
    return null
  }

  const isError = Boolean(error)
  const message = isError
    ? "无法继续，请重新登录后台。"
    : `已保存：${saved}`

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-[color:var(--accent)]/35 bg-[var(--accent-soft)] text-[color:var(--accent-strong)]"}`}
    >
      {message}
    </div>
  )
}

function normalizeEditorLocale(locale?: string) {
  return normalizeLocale(locale)
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

  const authorized = await isContentManagerAuthorized()
  const currentLocale = normalizeEditorLocale(searchParams.locale)

  if (!authorized) {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/content-manager?locale=${currentLocale}`)}`
    )
  }

  const [
    heroContent,
    headerContent,
    navContent,
    featuredProducts,
    productsPageContent,
    productUiContent,
    ageHighlights,
    footerContent,
    categoryPageContent,
    agePageContent,
    contactImages,
  ] =
    await Promise.all([
      getLocalizedHomeContentSection("hero_content", HERO_CONTENT, currentLocale),
      getLocalizedHomeContentSection("header_content", HEADER_CONTENT, currentLocale),
      getLocalizedHomeContentSection("nav_content", NAV_CONTENT, currentLocale),
      getLocalizedHomeContentSection("featured_products", FEATURED_PRODUCTS, currentLocale),
      getLocalizedHomeContentSection("products_page_content", PRODUCTS_PAGE_CONTENT, currentLocale),
      getLocalizedHomeContentSection("product_ui_content", PRODUCT_UI_CONTENT, currentLocale),
      getLocalizedHomeContentSection("age_highlights", AGE_HIGHLIGHTS, currentLocale),
      getLocalizedHomeContentSection("footer_content", FOOTER_CONTENT, currentLocale),
      getLocalizedHomeContentSection("category_page_content", CATEGORY_PAGE_CONTENT, currentLocale),
      getLocalizedHomeContentSection("age_page_content", AGE_PAGE_CONTENT, currentLocale),
      getSiteContentSection<ContactImagesContent>(
        "contact_images",
        CONTACT_IMAGES_CONTENT
      ),
    ])
  const headerContentWithSharedImages = applySharedContactImages(
    headerContent,
    contactImages
  )

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
                前台内容编辑
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-body)]">
                在这里编辑首页、分类卡片、年龄区块和页脚内容。保存后会直接写入数据库并覆盖默认前台配置。
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
            <StatusBanner saved={searchParams.saved} error={searchParams.error} />
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
          description="控制顶部品牌名、搜索框文案和首页页头中的联系方式。"
        >
          <form
            action={saveHeaderContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="品牌名称" name="brandName" defaultValue={headerContentWithSharedImages.brandName} />
              <Field label="搜索按钮无障碍标签" name="searchAriaLabel" defaultValue={headerContentWithSharedImages.searchAriaLabel} />
              <Field label="搜索框占位文案" name="searchPlaceholder" defaultValue={headerContentWithSharedImages.searchPlaceholder} />
              <Field label="移动端菜单按钮文案" name="mobileMenuLabel" defaultValue={headerContentWithSharedImages.mobileMenuLabel} />
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
          description="控制首页主导航文案、下拉分组和大菜单中的辅助说明。"
        >
          <form
            action={saveNavContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="移动端浏览文案" name="mobileBrowseLabel" defaultValue={navContent.mobileBrowseLabel} />
              <Field label="移动端关闭文案" name="mobileCloseLabel" defaultValue={navContent.mobileCloseLabel} />
              <Field label="探索文案" name="exploreLabel" defaultValue={navContent.exploreLabel} />
              <Field label="大菜单介绍前缀" name="megaMenuIntroLabelPrefix" defaultValue={navContent.megaMenuIntroLabelPrefix} />
              <Field label="移动端跳转前缀" name="mobileGoToPrefix" defaultValue={navContent.mobileGoToPrefix} />
              <TextareaField label="大菜单说明" name="megaMenuIntroDescription" defaultValue={navContent.megaMenuIntroDescription} rows={2} />
            </div>

            <div className="grid gap-4">
              {navContent.items.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    导航项 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="标题"
                      name={`items.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="直接链接"
                      name={`items.${index}.href`}
                      defaultValue={item.href ?? ""}
                    />
                  </div>
                  {item.groups?.map((group, groupIndex) => (
                    <div
                      key={`${group.title}-${groupIndex}`}
                      className="mt-4 rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-4"
                    >
                      <Field
                        label="分组标题"
                        name={`items.${index}.groups.${groupIndex}.title`}
                        defaultValue={group.title}
                      />
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {group.links.map((link, linkIndex) => (
                          <div key={`${link.label}-${linkIndex}`} className="rounded-[1rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.72)] p-4">
                            <div className="grid gap-4">
                              <Field
                                label="链接标题"
                                name={`items.${index}.groups.${groupIndex}.links.${linkIndex}.label`}
                                defaultValue={link.label}
                              />
                              <Field
                                label="链接地址"
                                name={`items.${index}.groups.${groupIndex}.links.${linkIndex}.href`}
                                defaultValue={link.href}
                              />
                              <TextareaField
                                label="说明"
                                name={`items.${index}.groups.${groupIndex}.links.${linkIndex}.description`}
                                defaultValue={link.description || ""}
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <SaveButton label="保存导航" />
          </form>
        </SectionCard>

        <SectionCard
          title="首屏"
          description="控制首页首屏横幅文案和两个主要按钮。"
        >
          <form
            action={saveHeroContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="眉题" name="eyebrow" defaultValue={heroContent.eyebrow} />
              <Field label="徽章标题" name="badgeLabel" defaultValue={heroContent.badgeLabel} />
              <Field label="主按钮文案" name="primaryCtaLabel" defaultValue={heroContent.primaryCtaLabel} />
              <Field label="主按钮链接" name="primaryCtaHref" defaultValue={heroContent.primaryCtaHref} />
              <Field label="次按钮文案" name="secondaryCtaLabel" defaultValue={heroContent.secondaryCtaLabel} />
              <Field label="次按钮链接" name="secondaryCtaHref" defaultValue={heroContent.secondaryCtaHref} />
            </div>

            <TextareaField label="主标题" name="title" defaultValue={heroContent.title} rows={3} />
            <TextareaField label="正文" name="body" defaultValue={heroContent.body} rows={4} />
            <TextareaField label="徽章文案" name="badgeText" defaultValue={heroContent.badgeText} rows={3} />

            <SaveButton label="保存首屏" />
          </form>
        </SectionCard>

        <SectionCard
          title="全部商品区块"
          description="控制首页商品网格上方的区块标签和标题。"
        >
          <form
            action={saveFeaturedProducts.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="眉题" name="eyebrow" defaultValue={featuredProducts.eyebrow} />
              <Field label="标题" name="title" defaultValue={featuredProducts.title} />
              <TextareaField label="副标题" name="subtitle" defaultValue={featuredProducts.subtitle} rows={2} />
              <Field label="展示策略" name="strategy" defaultValue={featuredProducts.strategy} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="显示商品名称"
                name="showProductNames"
                defaultChecked={featuredProducts.showProductNames ?? FEATURED_PRODUCTS.showProductNames}
              />
              <CheckboxField
                label="显示商品价格"
                name="showProductPrices"
                defaultChecked={featuredProducts.showProductPrices ?? FEATURED_PRODUCTS.showProductPrices}
              />
            </div>

            <SaveButton label="保存全部商品区块" />
          </form>
        </SectionCard>

        <SectionCard
          title="商品列表页"
          description="控制 /products 页面页头、搜索结果文案、首页链接文案和空状态。"
        >
          <form
            action={saveProductsPageContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="眉题" name="eyebrow" defaultValue={productsPageContent.eyebrow} />
              <Field label="默认标题" name="defaultTitle" defaultValue={productsPageContent.defaultTitle} />
              <Field label="首页文案" name="homeLabel" defaultValue={productsPageContent.homeLabel} />
              <Field label="搜索标题前缀" name="searchTitlePrefix" defaultValue={productsPageContent.searchTitlePrefix} />
              <Field label="搜索标题后缀" name="searchTitleSuffix" defaultValue={productsPageContent.searchTitleSuffix} />
              <Field label="结果数量前缀" name="searchResultsLabelPrefix" defaultValue={productsPageContent.searchResultsLabelPrefix} />
              <Field label="结果数量后缀" name="searchResultsLabelSuffix" defaultValue={productsPageContent.searchResultsLabelSuffix} />
            </div>
            <TextareaField label="默认说明" name="defaultDescription" defaultValue={productsPageContent.defaultDescription} rows={2} />
            <TextareaField label="空状态文案" name="emptyMessage" defaultValue={productsPageContent.emptyMessage} rows={2} />

            <SaveButton label="保存商品列表页" />
          </form>
        </SectionCard>

        <SectionCard
          title="商品 UI"
          description="控制按钮、年龄徽章、兜底文案和商品详情标签页中的固定文本。"
        >
          <form
            action={saveProductUiContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="联系按钮" name="contactLabel" defaultValue={productUiContent.contactLabel} />
              <Field label="查看详情" name="viewDetailsLabel" defaultValue={productUiContent.viewDetailsLabel} />
              <Field label="年龄前缀" name="agePrefix" defaultValue={productUiContent.agePrefix} />
              <Field label="年龄段前缀" name="agesPrefix" defaultValue={productUiContent.agesPrefix} />
              <Field label="无图片文案" name="noImageLabel" defaultValue={productUiContent.noImageLabel} />
              <Field label="商品信息标签" name="productInformationLabel" defaultValue={productUiContent.productInformationLabel} />
              <Field label="库存标签" name="availabilityLabel" defaultValue={productUiContent.availabilityLabel} />
              <Field label="材质标签" name="materialLabel" defaultValue={productUiContent.materialLabel} />
              <Field label="产地标签" name="countryOfOriginLabel" defaultValue={productUiContent.countryOfOriginLabel} />
              <Field label="类型标签" name="typeLabel" defaultValue={productUiContent.typeLabel} />
              <Field label="重量标签" name="weightLabel" defaultValue={productUiContent.weightLabel} />
              <Field label="尺寸标签" name="dimensionsLabel" defaultValue={productUiContent.dimensionsLabel} />
              <Field label="库存标题" name="availabilityTitle" defaultValue={productUiContent.availabilityTitle} />
            </div>
            <TextareaField label="联系说明" name="contactBody" defaultValue={productUiContent.contactBody} rows={3} />
            <TextareaField label="兜底描述" name="fallbackDescription" defaultValue={productUiContent.fallbackDescription} rows={2} />
            <TextareaField label="库存说明" name="availabilityBody" defaultValue={productUiContent.availabilityBody} rows={3} />

            <SaveButton label="保存商品 UI" />
          </form>
        </SectionCard>

        <SectionCard
          title="分类圆形入口"
          description="控制分类区块标题和 6 个圆形分类入口。"
        >
          <form
            action={saveAgeHighlights.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="眉题" name="eyebrow" defaultValue={ageHighlights.eyebrow} />
              <Field label="标题" name="title" defaultValue={ageHighlights.title} />
              <TextareaField label="副标题" name="subtitle" defaultValue={ageHighlights.subtitle} rows={2} />
            </div>

            <div className="grid gap-4">
              {ageHighlights.items.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    分类入口 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Field
                      label="圆圈文字"
                      name={`items.${index}.value`}
                      defaultValue={item.value}
                    />
                    <Field
                      label="小字"
                      name={`items.${index}.unit`}
                      defaultValue={item.unit}
                    />
                    <Field
                      label="标题"
                      name={`items.${index}.title`}
                      defaultValue={item.title}
                    />
                    <Field
                      label="链接"
                      name={`items.${index}.href`}
                      defaultValue={item.href}
                    />
                    <Field
                      label="图片 URL"
                      name={`items.${index}.image`}
                      defaultValue={item.image || ""}
                    />
                    <FileField
                      label="上传图片"
                      name={`items.${index}.imageFile`}
                      currentValue={item.image || ""}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存分类入口" />
          </form>
        </SectionCard>

        <SectionCard
          title="页脚"
          description="控制每个页面底部显示的品牌、网站、联系方式和社交图标链接。"
        >
          <form
            action={saveFooterContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="品牌名称" name="brandName" defaultValue={footerContent.brandName} />
              <Field label="网站文案" name="websiteLabel" defaultValue={footerContent.websiteLabel} />
              <Field label="网站链接" name="websiteHref" defaultValue={footerContent.websiteHref} />
              <Field label="联系方式文案" name="contactLabel" defaultValue={footerContent.contactLabel} />
              <Field label="联系方式链接" name="contactHref" defaultValue={footerContent.contactHref} />
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

        <SectionCard
          title="分类落地页"
          description="控制每个 /shop/category/... 落地页使用的眉题和说明。"
        >
          <form
            action={saveCategoryPageContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="眉题" name="eyebrow" defaultValue={categoryPageContent.eyebrow} />
              <TextareaField label="空状态文案" name="emptyMessage" defaultValue={categoryPageContent.emptyMessage} rows={3} />
            </div>

            <div className="grid gap-4">
              {categoryPageContent.pages.map((item, index) => (
                <div
                  key={`${item.slug}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    分类页面 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Slug"
                      name={`pages.${index}.slug`}
                      defaultValue={item.slug}
                    />
                    <Field
                      label="标题"
                      name={`pages.${index}.title`}
                      defaultValue={item.title}
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="说明"
                      name={`pages.${index}.description`}
                      defaultValue={item.description}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存分类落地页" />
          </form>
        </SectionCard>

        <SectionCard
          title="年龄落地页"
          description="控制每个 /shop/age/... 落地页使用的标题前缀、空状态、筛选标签和说明。"
        >
          <form
            action={saveAgePageContent.bind(null, countryCode, currentLocale)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="眉题" name="eyebrow" defaultValue={agePageContent.eyebrow} />
              <Field label="标题前缀" name="titlePrefix" defaultValue={agePageContent.titlePrefix} />
              <TextareaField label="空状态文案" name="emptyMessage" defaultValue={agePageContent.emptyMessage} rows={2} />
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                筛选标签
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agePageContent.filters.map((item, index) => (
                  <div key={`${item.value}-${index}`} className="rounded-[1rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-4">
                    <div className="grid gap-4">
                      <Field
                        label="标题"
                        name={`filters.${index}.label`}
                        defaultValue={item.label}
                      />
                      <Field
                        label="值"
                        name={`filters.${index}.value`}
                        defaultValue={item.value}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {agePageContent.pages.map((item, index) => (
                <div
                  key={`${item.slug}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5138]">
                    年龄页面 {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Slug"
                      name={`pages.${index}.slug`}
                      defaultValue={item.slug}
                    />
                    <Field
                      label="标题"
                      name={`pages.${index}.title`}
                      defaultValue={item.title}
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="说明"
                      name={`pages.${index}.description`}
                      defaultValue={item.description}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="保存年龄落地页" />
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
