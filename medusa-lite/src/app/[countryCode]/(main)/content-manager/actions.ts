"use server"

import { mkdir, writeFile } from "fs/promises"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import path from "path"

import { saveSiteContentSection } from "@lib/data/site-content"
import { CACHE_TAGS } from "@lib/data/cache"
import {
  AGE_HIGHLIGHTS,
  AGE_PAGE_CONTENT,
  CATEGORY_PAGE_CONTENT,
  CATEGORY_HIGHLIGHTS,
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
import { isContentManagerAuthorized } from "@lib/util/content-manager-auth"

function readString(
  formData: FormData,
  key: string,
  fallback = ""
) {
  const value = formData.get(key)

  if (typeof value !== "string") {
    return fallback
  }

  return value.trim()
}

function readBoolean(formData: FormData, key: string, fallback = false) {
  const value = formData.get(key)

  if (value === null) {
    return false
  }

  if (typeof value !== "string") {
    return fallback
  }

  return value === "on" || value === "true"
}

async function saveUploadedImage(
  formData: FormData,
  key: string,
  fallback: string,
  index: number,
  folder = "contact",
  prefix = "header-contact"
) {
  const value = formData.get(key)

  if (!(value instanceof File) || value.size === 0) {
    return fallback
  }

  if (!value.type.startsWith("image/")) {
    return fallback
  }

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }
  const extension = extensionByType[value.type] || "jpg"
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", folder)
  const filename = `${prefix}-${index + 1}-${Date.now()}.${extension}`
  const destination = path.resolve(uploadDir, filename)

  if (!destination.startsWith(uploadDir)) {
    return fallback
  }

  await mkdir(uploadDir, { recursive: true })
  await writeFile(destination, Buffer.from(await value.arrayBuffer()))

  return `/uploads/${folder}/${filename}`
}

async function requireContentManagerAccess() {
  const authorized = await isContentManagerAuthorized()

  if (!authorized) {
    redirect(`/content-manager?error=unauthorized`)
  }
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

function buildHeroContent(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", HERO_CONTENT.eyebrow),
    title: readString(formData, "title", HERO_CONTENT.title),
    body: readString(formData, "body", HERO_CONTENT.body),
    primaryCtaLabel: readString(
      formData,
      "primaryCtaLabel",
      HERO_CONTENT.primaryCtaLabel
    ),
    primaryCtaHref: readString(
      formData,
      "primaryCtaHref",
      HERO_CONTENT.primaryCtaHref
    ),
    secondaryCtaLabel: readString(
      formData,
      "secondaryCtaLabel",
      HERO_CONTENT.secondaryCtaLabel
    ),
    secondaryCtaHref: readString(
      formData,
      "secondaryCtaHref",
      HERO_CONTENT.secondaryCtaHref
    ),
    badgeLabel: readString(formData, "badgeLabel", HERO_CONTENT.badgeLabel),
    badgeText: readString(formData, "badgeText", HERO_CONTENT.badgeText),
  }
}

async function buildHeaderContent(formData: FormData) {
  const contactImages: ContactImagesContent = { ...CONTACT_IMAGES_CONTENT }
  const links = await Promise.all(
    HEADER_CONTENT.links.map(async (item, index) => {
      const typedUrl = readString(
        formData,
        `links.${index}.modalImageSrc`,
        item.modalImageSrc || ""
      )
      const modalImageSrc = await saveUploadedImage(
        formData,
        `links.${index}.modalImageFile`,
        typedUrl,
        index
      )
      const modalImageAlt = readString(
        formData,
        `links.${index}.modalImageAlt`,
        item.modalImageAlt || ""
      )
      const contactKey = getContactImageKey({
        href: readString(formData, `links.${index}.href`, item.href),
        label: readString(formData, `links.${index}.label`, item.label),
      })

      if (contactKey && modalImageSrc) {
        contactImages[contactKey] = {
          src: modalImageSrc,
          alt: modalImageAlt,
        }
      }

      return {
        label: readString(formData, `links.${index}.label`, item.label),
        detail: readString(formData, `links.${index}.detail`, item.detail),
        href: readString(formData, `links.${index}.href`, item.href),
        modalImageSrc,
        modalImageAlt,
      }
    })
  )

  return {
    headerContent: {
      brandName: readString(formData, "brandName", HEADER_CONTENT.brandName),
      searchAriaLabel: readString(
        formData,
        "searchAriaLabel",
        HEADER_CONTENT.searchAriaLabel
      ),
      searchPlaceholder: readString(
        formData,
        "searchPlaceholder",
        HEADER_CONTENT.searchPlaceholder
      ),
      mobileMenuLabel: readString(
        formData,
        "mobileMenuLabel",
        HEADER_CONTENT.mobileMenuLabel
      ),
      links,
    },
    contactImages,
  }
}

function buildNavContent(formData: FormData) {
  return {
    mobileBrowseLabel: readString(
      formData,
      "mobileBrowseLabel",
      NAV_CONTENT.mobileBrowseLabel
    ),
    mobileCloseLabel: readString(
      formData,
      "mobileCloseLabel",
      NAV_CONTENT.mobileCloseLabel
    ),
    exploreLabel: readString(
      formData,
      "exploreLabel",
      NAV_CONTENT.exploreLabel
    ),
    megaMenuIntroLabelPrefix: readString(
      formData,
      "megaMenuIntroLabelPrefix",
      NAV_CONTENT.megaMenuIntroLabelPrefix
    ),
    megaMenuIntroDescription: readString(
      formData,
      "megaMenuIntroDescription",
      NAV_CONTENT.megaMenuIntroDescription
    ),
    mobileGoToPrefix: readString(
      formData,
      "mobileGoToPrefix",
      NAV_CONTENT.mobileGoToPrefix
    ),
    items: NAV_CONTENT.items.map((item, index) => ({
      label: readString(formData, `items.${index}.label`, item.label),
      href: readString(formData, `items.${index}.href`, item.href ?? ""),
      groups: item.groups?.map((group, groupIndex) => ({
        title: readString(
          formData,
          `items.${index}.groups.${groupIndex}.title`,
          group.title
        ),
        links: group.links.map((link, linkIndex) => ({
          label: readString(
            formData,
            `items.${index}.groups.${groupIndex}.links.${linkIndex}.label`,
            link.label
          ),
          href: readString(
            formData,
            `items.${index}.groups.${groupIndex}.links.${linkIndex}.href`,
            link.href
          ),
          description: readString(
            formData,
            `items.${index}.groups.${groupIndex}.links.${linkIndex}.description`,
            link.description || ""
          ),
        })),
      })),
    })),
  }
}

function buildFeaturedProducts(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", FEATURED_PRODUCTS.eyebrow),
    title: readString(formData, "title", FEATURED_PRODUCTS.title),
    subtitle: readString(formData, "subtitle", FEATURED_PRODUCTS.subtitle),
    strategy: readString(formData, "strategy", FEATURED_PRODUCTS.strategy),
    showProductNames: readBoolean(
      formData,
      "showProductNames",
      FEATURED_PRODUCTS.showProductNames
    ),
    showProductPrices: readBoolean(
      formData,
      "showProductPrices",
      FEATURED_PRODUCTS.showProductPrices
    ),
  }
}

function buildProductsPageContent(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", PRODUCTS_PAGE_CONTENT.eyebrow),
    defaultTitle: readString(
      formData,
      "defaultTitle",
      PRODUCTS_PAGE_CONTENT.defaultTitle
    ),
    searchTitlePrefix: readString(
      formData,
      "searchTitlePrefix",
      PRODUCTS_PAGE_CONTENT.searchTitlePrefix
    ),
    searchTitleSuffix: readString(
      formData,
      "searchTitleSuffix",
      PRODUCTS_PAGE_CONTENT.searchTitleSuffix
    ),
    defaultDescription: readString(
      formData,
      "defaultDescription",
      PRODUCTS_PAGE_CONTENT.defaultDescription
    ),
    searchResultsLabelPrefix: readString(
      formData,
      "searchResultsLabelPrefix",
      PRODUCTS_PAGE_CONTENT.searchResultsLabelPrefix
    ),
    searchResultsLabelSuffix: readString(
      formData,
      "searchResultsLabelSuffix",
      PRODUCTS_PAGE_CONTENT.searchResultsLabelSuffix
    ),
    homeLabel: readString(
      formData,
      "homeLabel",
      PRODUCTS_PAGE_CONTENT.homeLabel
    ),
    emptyMessage: readString(
      formData,
      "emptyMessage",
      PRODUCTS_PAGE_CONTENT.emptyMessage
    ),
  }
}

function buildProductUiContent(formData: FormData) {
  return {
    contactLabel: readString(
      formData,
      "contactLabel",
      PRODUCT_UI_CONTENT.contactLabel
    ),
    contactBody: readString(
      formData,
      "contactBody",
      PRODUCT_UI_CONTENT.contactBody
    ),
    viewDetailsLabel: readString(
      formData,
      "viewDetailsLabel",
      PRODUCT_UI_CONTENT.viewDetailsLabel
    ),
    agePrefix: readString(
      formData,
      "agePrefix",
      PRODUCT_UI_CONTENT.agePrefix
    ),
    agesPrefix: readString(
      formData,
      "agesPrefix",
      PRODUCT_UI_CONTENT.agesPrefix
    ),
    noImageLabel: readString(
      formData,
      "noImageLabel",
      PRODUCT_UI_CONTENT.noImageLabel
    ),
    fallbackDescription: readString(
      formData,
      "fallbackDescription",
      PRODUCT_UI_CONTENT.fallbackDescription
    ),
    productInformationLabel: readString(
      formData,
      "productInformationLabel",
      PRODUCT_UI_CONTENT.productInformationLabel
    ),
    availabilityLabel: readString(
      formData,
      "availabilityLabel",
      PRODUCT_UI_CONTENT.availabilityLabel
    ),
    materialLabel: readString(
      formData,
      "materialLabel",
      PRODUCT_UI_CONTENT.materialLabel
    ),
    countryOfOriginLabel: readString(
      formData,
      "countryOfOriginLabel",
      PRODUCT_UI_CONTENT.countryOfOriginLabel
    ),
    typeLabel: readString(
      formData,
      "typeLabel",
      PRODUCT_UI_CONTENT.typeLabel
    ),
    weightLabel: readString(
      formData,
      "weightLabel",
      PRODUCT_UI_CONTENT.weightLabel
    ),
    dimensionsLabel: readString(
      formData,
      "dimensionsLabel",
      PRODUCT_UI_CONTENT.dimensionsLabel
    ),
    availabilityTitle: readString(
      formData,
      "availabilityTitle",
      PRODUCT_UI_CONTENT.availabilityTitle
    ),
    availabilityBody: readString(
      formData,
      "availabilityBody",
      PRODUCT_UI_CONTENT.availabilityBody
    ),
  }
}

function buildCategoryHighlights(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", CATEGORY_HIGHLIGHTS.eyebrow),
    title: readString(formData, "title", CATEGORY_HIGHLIGHTS.title),
    subtitle: readString(formData, "subtitle", CATEGORY_HIGHLIGHTS.subtitle),
    items: CATEGORY_HIGHLIGHTS.items.map((item, index) => ({
      title: readString(formData, `items.${index}.title`, item.title),
      description: readString(
        formData,
        `items.${index}.description`,
        item.description
      ),
      ctaLabel: readString(formData, `items.${index}.ctaLabel`, item.ctaLabel),
      href: readString(formData, `items.${index}.href`, item.href),
      image: readString(formData, `items.${index}.image`, item.image),
    })),
  }
}

async function buildAgeHighlights(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", AGE_HIGHLIGHTS.eyebrow),
    title: readString(formData, "title", AGE_HIGHLIGHTS.title),
    subtitle: readString(formData, "subtitle", AGE_HIGHLIGHTS.subtitle),
    items: await Promise.all(
      AGE_HIGHLIGHTS.items.map(async (item, index) => {
        const typedImage = readString(
          formData,
          `items.${index}.image`,
          item.image || ""
        )

        return {
          value: readString(formData, `items.${index}.value`, item.value),
          unit: readString(formData, `items.${index}.unit`, item.unit),
          title: readString(formData, `items.${index}.title`, item.title),
          href: readString(formData, `items.${index}.href`, item.href),
          image: await saveUploadedImage(
            formData,
            `items.${index}.imageFile`,
            typedImage,
            index,
            "content",
            "category-circle"
          ),
        }
      })
    ),
  }
}

function buildFooterContent(formData: FormData) {
  return {
    brandName: readString(formData, "brandName", FOOTER_CONTENT.brandName),
    websiteLabel: readString(
      formData,
      "websiteLabel",
      FOOTER_CONTENT.websiteLabel
    ),
    websiteHref: readString(
      formData,
      "websiteHref",
      FOOTER_CONTENT.websiteHref
    ),
    contactLabel: readString(
      formData,
      "contactLabel",
      FOOTER_CONTENT.contactLabel
    ),
    contactHref: readString(
      formData,
      "contactHref",
      FOOTER_CONTENT.contactHref
    ),
    socialLinks: FOOTER_CONTENT.socialLinks.map((item, index) => ({
      label: readString(formData, `socialLinks.${index}.label`, item.label),
      href: readString(formData, `socialLinks.${index}.href`, item.href),
    })),
  }
}

function buildCategoryPageContent(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", CATEGORY_PAGE_CONTENT.eyebrow),
    emptyMessage: readString(
      formData,
      "emptyMessage",
      CATEGORY_PAGE_CONTENT.emptyMessage
    ),
    pages: CATEGORY_PAGE_CONTENT.pages.map((item, index) => ({
      slug: readString(formData, `pages.${index}.slug`, item.slug),
      title: readString(formData, `pages.${index}.title`, item.title),
      description: readString(
        formData,
        `pages.${index}.description`,
        item.description
      ),
    })),
  }
}

function buildAgePageContent(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", AGE_PAGE_CONTENT.eyebrow),
    titlePrefix: readString(
      formData,
      "titlePrefix",
      AGE_PAGE_CONTENT.titlePrefix
    ),
    emptyMessage: readString(
      formData,
      "emptyMessage",
      AGE_PAGE_CONTENT.emptyMessage
    ),
    filters: AGE_PAGE_CONTENT.filters.map((item, index) => ({
      label: readString(formData, `filters.${index}.label`, item.label),
      value: readString(formData, `filters.${index}.value`, item.value),
    })),
    pages: AGE_PAGE_CONTENT.pages.map((item, index) => ({
      slug: readString(formData, `pages.${index}.slug`, item.slug),
      title: readString(formData, `pages.${index}.title`, item.title),
      description: readString(
        formData,
        `pages.${index}.description`,
        item.description
      ),
    })),
  }
}

async function saveSection(
  countryCode: string,
  locale: string,
  section: string,
  formData: FormData
) {
  await requireContentManagerAccess()

  let payload: unknown
  let sharedContactImages: ContactImagesContent | null = null

  switch (section) {
    case "hero_content":
      payload = buildHeroContent(formData)
      break
    case "header_content":
      {
        const result = await buildHeaderContent(formData)
        payload = result.headerContent
        sharedContactImages = result.contactImages
      }
      break
    case "nav_content":
      payload = buildNavContent(formData)
      break
    case "featured_products":
      payload = buildFeaturedProducts(formData)
      break
    case "products_page_content":
      payload = buildProductsPageContent(formData)
      break
    case "product_ui_content":
      payload = buildProductUiContent(formData)
      break
    case "category_highlights":
      payload = buildCategoryHighlights(formData)
      break
    case "age_highlights":
      payload = await buildAgeHighlights(formData)
      break
    case "footer_content":
      payload = buildFooterContent(formData)
      break
    case "category_page_content":
      payload = buildCategoryPageContent(formData)
      break
    case "age_page_content":
      payload = buildAgePageContent(formData)
      break
    default:
      redirect(`/content-manager?error=unknown-section`)
  }

  await saveSiteContentSection(section, payload, locale)
  if (sharedContactImages) {
    await saveSiteContentSection("contact_images", sharedContactImages)
  }
  revalidateTag(CACHE_TAGS.siteContent)
  revalidateTag(CACHE_TAGS.products)
  revalidateTag(CACHE_TAGS.categories)
  revalidatePath(`/`)
  revalidatePath(`/products`)
  revalidatePath(`/content-manager`)
  redirect(`/content-manager?locale=${locale}&saved=${section}`)
}

export async function saveHeroContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "hero_content", formData)
}

export async function saveHeaderContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "header_content", formData)
}

export async function saveNavContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "nav_content", formData)
}

export async function saveFeaturedProducts(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "featured_products", formData)
}

export async function saveProductsPageContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "products_page_content", formData)
}

export async function saveProductUiContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "product_ui_content", formData)
}

export async function saveCategoryHighlights(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "category_highlights", formData)
}

export async function saveAgeHighlights(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "age_highlights", formData)
}

export async function saveFooterContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "footer_content", formData)
}

export async function saveCategoryPageContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "category_page_content", formData)
}

export async function saveAgePageContent(
  countryCode: string,
  locale: string,
  formData: FormData
) {
  await saveSection(countryCode, locale, "age_page_content", formData)
}
