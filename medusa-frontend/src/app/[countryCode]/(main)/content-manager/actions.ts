"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { saveSiteContentSection } from "@lib/data/site-content"
import {
  AGE_HIGHLIGHTS,
  AGE_PAGE_CONTENT,
  CATEGORY_PAGE_CONTENT,
  CATEGORY_HIGHLIGHTS,
  FOOTER_CONTENT,
  HEADER_CONTENT,
  HERO_CONTENT,
  NAV_CONTENT,
  FEATURED_PRODUCTS,
  PRODUCTS_PAGE_CONTENT,
  PRODUCT_UI_CONTENT,
} from "@lib/data/homepage"
import {
  CONTENT_MANAGER_COOKIE,
  getContentManagerKey,
  isContentManagerAuthorized,
} from "@lib/util/content-manager-auth"

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

async function requireContentManagerAccess(countryCode: string) {
  const authorized = await isContentManagerAuthorized()

  if (!authorized) {
    redirect(`/${countryCode}/content-manager?error=unauthorized`)
  }
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

function buildHeaderContent(formData: FormData) {
  return {
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
    links: HEADER_CONTENT.links.map((item, index) => ({
      label: readString(formData, `links.${index}.label`, item.label),
      detail: readString(formData, `links.${index}.detail`, item.detail),
      href: readString(formData, `links.${index}.href`, item.href),
    })),
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
    addToCartLabel: readString(
      formData,
      "addToCartLabel",
      PRODUCT_UI_CONTENT.addToCartLabel
    ),
    selectVariantLabel: readString(
      formData,
      "selectVariantLabel",
      PRODUCT_UI_CONTENT.selectVariantLabel
    ),
    outOfStockLabel: readString(
      formData,
      "outOfStockLabel",
      PRODUCT_UI_CONTENT.outOfStockLabel
    ),
    selectOptionsLabel: readString(
      formData,
      "selectOptionsLabel",
      PRODUCT_UI_CONTENT.selectOptionsLabel
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
    shippingReturnsLabel: readString(
      formData,
      "shippingReturnsLabel",
      PRODUCT_UI_CONTENT.shippingReturnsLabel
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
    fastDeliveryTitle: readString(
      formData,
      "fastDeliveryTitle",
      PRODUCT_UI_CONTENT.fastDeliveryTitle
    ),
    fastDeliveryBody: readString(
      formData,
      "fastDeliveryBody",
      PRODUCT_UI_CONTENT.fastDeliveryBody
    ),
    simpleExchangesTitle: readString(
      formData,
      "simpleExchangesTitle",
      PRODUCT_UI_CONTENT.simpleExchangesTitle
    ),
    simpleExchangesBody: readString(
      formData,
      "simpleExchangesBody",
      PRODUCT_UI_CONTENT.simpleExchangesBody
    ),
    easyReturnsTitle: readString(
      formData,
      "easyReturnsTitle",
      PRODUCT_UI_CONTENT.easyReturnsTitle
    ),
    easyReturnsBody: readString(
      formData,
      "easyReturnsBody",
      PRODUCT_UI_CONTENT.easyReturnsBody
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

function buildAgeHighlights(formData: FormData) {
  return {
    eyebrow: readString(formData, "eyebrow", AGE_HIGHLIGHTS.eyebrow),
    title: readString(formData, "title", AGE_HIGHLIGHTS.title),
    subtitle: readString(formData, "subtitle", AGE_HIGHLIGHTS.subtitle),
    items: AGE_HIGHLIGHTS.items.map((item, index) => ({
      value: readString(formData, `items.${index}.value`, item.value),
      unit: readString(formData, `items.${index}.unit`, item.unit),
      title: readString(formData, `items.${index}.title`, item.title),
      href: readString(formData, `items.${index}.href`, item.href),
    })),
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
  section: string,
  formData: FormData
) {
  await requireContentManagerAccess(countryCode)

  let payload: unknown

  switch (section) {
    case "hero_content":
      payload = buildHeroContent(formData)
      break
    case "header_content":
      payload = buildHeaderContent(formData)
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
      payload = buildAgeHighlights(formData)
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
      redirect(`/${countryCode}/content-manager?error=unknown-section`)
  }

  await saveSiteContentSection(section, payload)
  revalidatePath(`/${countryCode}`)
  revalidatePath(`/${countryCode}/content-manager`)
  redirect(`/${countryCode}/content-manager?saved=${section}`)
}

export async function loginContentManager(
  countryCode: string,
  formData: FormData
) {
  const key = getContentManagerKey()
  const submitted = readString(formData, "accessKey")

  if (!key) {
    redirect(`/${countryCode}/content-manager`)
  }

  if (submitted !== key) {
    redirect(`/${countryCode}/content-manager?error=invalid-key`)
  }

  const cookieStore = await cookies()

  cookieStore.set(CONTENT_MANAGER_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  })

  redirect(`/${countryCode}/content-manager`)
}

export async function logoutContentManager(countryCode: string) {
  const cookieStore = await cookies()
  cookieStore.delete(CONTENT_MANAGER_COOKIE)
  redirect(`/${countryCode}/content-manager`)
}

export async function saveHeroContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "hero_content", formData)
}

export async function saveHeaderContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "header_content", formData)
}

export async function saveNavContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "nav_content", formData)
}

export async function saveFeaturedProducts(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "featured_products", formData)
}

export async function saveProductsPageContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "products_page_content", formData)
}

export async function saveProductUiContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "product_ui_content", formData)
}

export async function saveCategoryHighlights(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "category_highlights", formData)
}

export async function saveAgeHighlights(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "age_highlights", formData)
}

export async function saveFooterContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "footer_content", formData)
}

export async function saveCategoryPageContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "category_page_content", formData)
}

export async function saveAgePageContent(
  countryCode: string,
  formData: FormData
) {
  await saveSection(countryCode, "age_page_content", formData)
}
