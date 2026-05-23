import Link from "next/link"

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
import { getSiteContentSection } from "@lib/data/site-content"
import {
  getContentManagerKey,
  isContentManagerAuthorized,
} from "@lib/util/content-manager-auth"

import {
  loginContentManager,
  logoutContentManager,
  saveAgePageContent,
  saveAgeHighlights,
  saveCategoryPageContent,
  saveCategoryHighlights,
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
      <span className="text-sm font-medium text-[color:var(--text-body)]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="h-12 rounded-2xl border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] px-4 text-sm text-[color:var(--text-strong)] outline-none transition duration-300 ease-out hover:border-[color:var(--accent)]/35 focus:border-[color:var(--accent)]"
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
      <span className="text-sm font-medium text-[color:var(--text-body)]">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="rounded-2xl border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none transition duration-300 ease-out hover:border-[color:var(--accent)]/35 focus:border-[color:var(--accent)]"
      />
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
    ? error === "invalid-key"
      ? "Access key is incorrect."
      : "Unable to continue. Please sign in again."
    : `Saved: ${saved}`

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-[color:var(--accent)]/35 bg-[var(--accent-soft)] text-[color:var(--accent-strong)]"}`}
    >
      {message}
    </div>
  )
}

export default async function ContentManagerPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const [{ countryCode }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])

  const accessKeyConfigured = Boolean(getContentManagerKey())
  const authorized = await isContentManagerAuthorized()

  if (accessKeyConfigured && !authorized) {
    return (
      <main className="bg-[var(--bg-canvas)] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-8 shadow-[0_22px_55px_-38px_rgba(92,72,45,0.2)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            Content Manager
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text-strong)]">
            Sign in to edit storefront content
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-body)]">
            This page controls homepage copy, category cards, age blocks, and footer contact details.
          </p>

          <div className="mt-6">
            <StatusBanner error={searchParams.error} />
          </div>

          <form
            action={loginContentManager.bind(null, countryCode)}
            className="mt-6 flex flex-col gap-4"
          >
            <Field label="Access key" name="accessKey" defaultValue="" type="password" />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-[color:var(--accent-strong)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#dfead8]"
            >
              Enter Content Manager
            </button>
          </form>
        </div>
      </main>
    )
  }

  const [
    heroContent,
    headerContent,
    navContent,
    featuredProducts,
    productsPageContent,
    productUiContent,
    categoryHighlights,
    ageHighlights,
    footerContent,
    categoryPageContent,
    agePageContent,
  ] =
    await Promise.all([
      getSiteContentSection("hero_content", HERO_CONTENT),
      getSiteContentSection("header_content", HEADER_CONTENT),
      getSiteContentSection("nav_content", NAV_CONTENT),
      getSiteContentSection("featured_products", FEATURED_PRODUCTS),
      getSiteContentSection("products_page_content", PRODUCTS_PAGE_CONTENT),
      getSiteContentSection("product_ui_content", PRODUCT_UI_CONTENT),
      getSiteContentSection("category_highlights", CATEGORY_HIGHLIGHTS),
      getSiteContentSection("age_highlights", AGE_HIGHLIGHTS),
      getSiteContentSection("footer_content", FOOTER_CONTENT),
      getSiteContentSection("category_page_content", CATEGORY_PAGE_CONTENT),
      getSiteContentSection("age_page_content", AGE_PAGE_CONTENT),
    ])

  return (
    <main className="bg-[var(--bg-canvas)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-6 shadow-[0_22px_55px_-38px_rgba(92,72,45,0.2)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
                Content Manager
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text-strong)]">
                Storefront copy editor
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-body)]">
                Edit the homepage and footer without touching code. Each block saves directly to the database and overrides the default frontend config.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${countryCode}`}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] px-5 py-3 text-sm font-semibold text-[color:var(--text-strong)] transition duration-300 ease-out hover:border-[color:var(--accent)]/35 hover:bg-[var(--accent-soft)]"
              >
                View homepage
              </Link>
              {accessKeyConfigured ? (
                <form action={logoutContentManager.bind(null, countryCode)}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-transparent px-5 py-3 text-sm font-semibold text-[color:var(--text-body)] transition duration-300 ease-out hover:border-[color:var(--accent)]/35 hover:bg-[rgba(255,250,242,0.72)]"
                  >
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <StatusBanner saved={searchParams.saved} error={searchParams.error} />
          </div>
        </div>

        <SectionCard
          title="Header"
          description="Controls the top brand name, search bar copy, and the contact links shown on the homepage header."
        >
          <form
            action={saveHeaderContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand name" name="brandName" defaultValue={headerContent.brandName} />
              <Field label="Search button aria label" name="searchAriaLabel" defaultValue={headerContent.searchAriaLabel} />
              <Field label="Search placeholder" name="searchPlaceholder" defaultValue={headerContent.searchPlaceholder} />
              <Field label="Mobile menu button label" name="mobileMenuLabel" defaultValue={headerContent.mobileMenuLabel} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {headerContent.links.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Contact link {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="Label"
                      name={`links.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="Detail"
                      name={`links.${index}.detail`}
                      defaultValue={item.detail}
                    />
                    <Field
                      label="Link"
                      name={`links.${index}.href`}
                      defaultValue={item.href}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save header section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Navigation"
          description="Controls the main homepage navigation labels, dropdown groups, and helper copy used inside the mega menu."
        >
          <form
            action={saveNavContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Mobile browse label" name="mobileBrowseLabel" defaultValue={navContent.mobileBrowseLabel} />
              <Field label="Mobile close label" name="mobileCloseLabel" defaultValue={navContent.mobileCloseLabel} />
              <Field label="Explore label" name="exploreLabel" defaultValue={navContent.exploreLabel} />
              <Field label="Mega menu intro prefix" name="megaMenuIntroLabelPrefix" defaultValue={navContent.megaMenuIntroLabelPrefix} />
              <Field label="Mobile go-to prefix" name="mobileGoToPrefix" defaultValue={navContent.mobileGoToPrefix} />
              <TextareaField label="Mega menu description" name="megaMenuIntroDescription" defaultValue={navContent.megaMenuIntroDescription} rows={2} />
            </div>

            <div className="grid gap-4">
              {navContent.items.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Nav item {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Label"
                      name={`items.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="Direct link"
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
                        label="Group title"
                        name={`items.${index}.groups.${groupIndex}.title`}
                        defaultValue={group.title}
                      />
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {group.links.map((link, linkIndex) => (
                          <div key={`${link.label}-${linkIndex}`} className="rounded-[1rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.72)] p-4">
                            <div className="grid gap-4">
                              <Field
                                label="Link label"
                                name={`items.${index}.groups.${groupIndex}.links.${linkIndex}.label`}
                                defaultValue={link.label}
                              />
                              <Field
                                label="Link href"
                                name={`items.${index}.groups.${groupIndex}.links.${linkIndex}.href`}
                                defaultValue={link.href}
                              />
                              <TextareaField
                                label="Description"
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

            <SaveButton label="Save navigation section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Hero"
          description="Controls the first screen banner copy and the two main action buttons."
        >
          <form
            action={saveHeroContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow" name="eyebrow" defaultValue={heroContent.eyebrow} />
              <Field label="Badge label" name="badgeLabel" defaultValue={heroContent.badgeLabel} />
              <Field label="Primary button label" name="primaryCtaLabel" defaultValue={heroContent.primaryCtaLabel} />
              <Field label="Primary button link" name="primaryCtaHref" defaultValue={heroContent.primaryCtaHref} />
              <Field label="Secondary button label" name="secondaryCtaLabel" defaultValue={heroContent.secondaryCtaLabel} />
              <Field label="Secondary button link" name="secondaryCtaHref" defaultValue={heroContent.secondaryCtaHref} />
            </div>

            <TextareaField label="Main title" name="title" defaultValue={heroContent.title} rows={3} />
            <TextareaField label="Body" name="body" defaultValue={heroContent.body} rows={4} />
            <TextareaField label="Badge text" name="badgeText" defaultValue={heroContent.badgeText} rows={3} />

            <SaveButton label="Save hero section" />
          </form>
        </SectionCard>

        <SectionCard
          title="All products section"
          description="Controls the section label and title above the homepage product grid."
        >
          <form
            action={saveFeaturedProducts.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow" name="eyebrow" defaultValue={featuredProducts.eyebrow} />
              <Field label="Title" name="title" defaultValue={featuredProducts.title} />
              <TextareaField label="Subtitle" name="subtitle" defaultValue={featuredProducts.subtitle} rows={2} />
              <Field label="Strategy" name="strategy" defaultValue={featuredProducts.strategy} />
            </div>

            <SaveButton label="Save all products section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Products page"
          description="Controls the standalone /products page header, search result copy, home link label, and empty state."
        >
          <form
            action={saveProductsPageContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Eyebrow" name="eyebrow" defaultValue={productsPageContent.eyebrow} />
              <Field label="Default title" name="defaultTitle" defaultValue={productsPageContent.defaultTitle} />
              <Field label="Home label" name="homeLabel" defaultValue={productsPageContent.homeLabel} />
              <Field label="Search title prefix" name="searchTitlePrefix" defaultValue={productsPageContent.searchTitlePrefix} />
              <Field label="Search title suffix" name="searchTitleSuffix" defaultValue={productsPageContent.searchTitleSuffix} />
              <Field label="Results prefix" name="searchResultsLabelPrefix" defaultValue={productsPageContent.searchResultsLabelPrefix} />
              <Field label="Results suffix" name="searchResultsLabelSuffix" defaultValue={productsPageContent.searchResultsLabelSuffix} />
            </div>
            <TextareaField label="Default description" name="defaultDescription" defaultValue={productsPageContent.defaultDescription} rows={2} />
            <TextareaField label="Empty state message" name="emptyMessage" defaultValue={productsPageContent.emptyMessage} rows={2} />

            <SaveButton label="Save products page" />
          </form>
        </SectionCard>

        <SectionCard
          title="Product UI"
          description="Controls button labels, age badges, fallback copy, and the fixed text inside the product detail tabs."
        >
          <form
            action={saveProductUiContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Add to cart" name="addToCartLabel" defaultValue={productUiContent.addToCartLabel} />
              <Field label="Select variant" name="selectVariantLabel" defaultValue={productUiContent.selectVariantLabel} />
              <Field label="Out of stock" name="outOfStockLabel" defaultValue={productUiContent.outOfStockLabel} />
              <Field label="Select options" name="selectOptionsLabel" defaultValue={productUiContent.selectOptionsLabel} />
              <Field label="View details" name="viewDetailsLabel" defaultValue={productUiContent.viewDetailsLabel} />
              <Field label="Age prefix" name="agePrefix" defaultValue={productUiContent.agePrefix} />
              <Field label="Ages prefix" name="agesPrefix" defaultValue={productUiContent.agesPrefix} />
              <Field label="No image label" name="noImageLabel" defaultValue={productUiContent.noImageLabel} />
              <Field label="Product information tab" name="productInformationLabel" defaultValue={productUiContent.productInformationLabel} />
              <Field label="Shipping tab" name="shippingReturnsLabel" defaultValue={productUiContent.shippingReturnsLabel} />
              <Field label="Material label" name="materialLabel" defaultValue={productUiContent.materialLabel} />
              <Field label="Country of origin label" name="countryOfOriginLabel" defaultValue={productUiContent.countryOfOriginLabel} />
              <Field label="Type label" name="typeLabel" defaultValue={productUiContent.typeLabel} />
              <Field label="Weight label" name="weightLabel" defaultValue={productUiContent.weightLabel} />
              <Field label="Dimensions label" name="dimensionsLabel" defaultValue={productUiContent.dimensionsLabel} />
              <Field label="Fast delivery title" name="fastDeliveryTitle" defaultValue={productUiContent.fastDeliveryTitle} />
              <Field label="Simple exchanges title" name="simpleExchangesTitle" defaultValue={productUiContent.simpleExchangesTitle} />
              <Field label="Easy returns title" name="easyReturnsTitle" defaultValue={productUiContent.easyReturnsTitle} />
            </div>
            <TextareaField label="Fallback description" name="fallbackDescription" defaultValue={productUiContent.fallbackDescription} rows={2} />
            <TextareaField label="Fast delivery body" name="fastDeliveryBody" defaultValue={productUiContent.fastDeliveryBody} rows={3} />
            <TextareaField label="Simple exchanges body" name="simpleExchangesBody" defaultValue={productUiContent.simpleExchangesBody} rows={3} />
            <TextareaField label="Easy returns body" name="easyReturnsBody" defaultValue={productUiContent.easyReturnsBody} rows={3} />

            <SaveButton label="Save product UI" />
          </form>
        </SectionCard>

        <SectionCard
          title="Shop by category"
          description="Controls the category section title and the six image cards shown on the homepage."
        >
          <form
            action={saveCategoryHighlights.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Eyebrow" name="eyebrow" defaultValue={categoryHighlights.eyebrow} />
              <Field label="Title" name="title" defaultValue={categoryHighlights.title} />
              <TextareaField label="Subtitle" name="subtitle" defaultValue={categoryHighlights.subtitle} rows={2} />
            </div>

            <div className="grid gap-4">
              {categoryHighlights.items.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Card {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Title"
                      name={`items.${index}.title`}
                      defaultValue={item.title}
                    />
                    <Field
                      label="Button label"
                      name={`items.${index}.ctaLabel`}
                      defaultValue={item.ctaLabel}
                    />
                    <Field
                      label="Link"
                      name={`items.${index}.href`}
                      defaultValue={item.href}
                    />
                    <Field
                      label="Image URL"
                      name={`items.${index}.image`}
                      defaultValue={item.image}
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="Description"
                      name={`items.${index}.description`}
                      defaultValue={item.description}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save category section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Shop by age"
          description="Controls the age section title and the six circular age entry points."
        >
          <form
            action={saveAgeHighlights.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Eyebrow" name="eyebrow" defaultValue={ageHighlights.eyebrow} />
              <Field label="Title" name="title" defaultValue={ageHighlights.title} />
              <TextareaField label="Subtitle" name="subtitle" defaultValue={ageHighlights.subtitle} rows={2} />
            </div>

            <div className="grid gap-4">
              {ageHighlights.items.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Age card {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Field
                      label="Value"
                      name={`items.${index}.value`}
                      defaultValue={item.value}
                    />
                    <Field
                      label="Unit"
                      name={`items.${index}.unit`}
                      defaultValue={item.unit}
                    />
                    <Field
                      label="Title"
                      name={`items.${index}.title`}
                      defaultValue={item.title}
                    />
                    <Field
                      label="Link"
                      name={`items.${index}.href`}
                      defaultValue={item.href}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save age section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Footer"
          description="Controls the brand, website, contact line, and the social icon links shown at the bottom of every page."
        >
          <form
            action={saveFooterContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand name" name="brandName" defaultValue={footerContent.brandName} />
              <Field label="Website label" name="websiteLabel" defaultValue={footerContent.websiteLabel} />
              <Field label="Website link" name="websiteHref" defaultValue={footerContent.websiteHref} />
              <Field label="Contact label" name="contactLabel" defaultValue={footerContent.contactLabel} />
              <Field label="Contact link" name="contactHref" defaultValue={footerContent.contactHref} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {footerContent.socialLinks.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Social link {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="Label"
                      name={`socialLinks.${index}.label`}
                      defaultValue={item.label}
                    />
                    <Field
                      label="Link"
                      name={`socialLinks.${index}.href`}
                      defaultValue={item.href}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save footer section" />
          </form>
        </SectionCard>

        <SectionCard
          title="Category landing pages"
          description="Controls the eyebrow and descriptions used on each /shop/category/... landing page."
        >
          <form
            action={saveCategoryPageContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow" name="eyebrow" defaultValue={categoryPageContent.eyebrow} />
              <TextareaField label="Empty state message" name="emptyMessage" defaultValue={categoryPageContent.emptyMessage} rows={3} />
            </div>

            <div className="grid gap-4">
              {categoryPageContent.pages.map((item, index) => (
                <div
                  key={`${item.slug}-${index}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Category page {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Slug"
                      name={`pages.${index}.slug`}
                      defaultValue={item.slug}
                    />
                    <Field
                      label="Title"
                      name={`pages.${index}.title`}
                      defaultValue={item.title}
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="Description"
                      name={`pages.${index}.description`}
                      defaultValue={item.description}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save category landing pages" />
          </form>
        </SectionCard>

        <SectionCard
          title="Age landing pages"
          description="Controls the title prefix, empty state, filter pills, and descriptions used on each /shop/age/... landing page."
        >
          <form
            action={saveAgePageContent.bind(null, countryCode)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Eyebrow" name="eyebrow" defaultValue={agePageContent.eyebrow} />
              <Field label="Title prefix" name="titlePrefix" defaultValue={agePageContent.titlePrefix} />
              <TextareaField label="Empty state message" name="emptyMessage" defaultValue={agePageContent.emptyMessage} rows={2} />
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.7)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Filter pills
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agePageContent.filters.map((item, index) => (
                  <div key={`${item.value}-${index}`} className="rounded-[1rem] border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-4">
                    <div className="grid gap-4">
                      <Field
                        label="Label"
                        name={`filters.${index}.label`}
                        defaultValue={item.label}
                      />
                      <Field
                        label="Value"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Age page {index + 1}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="Slug"
                      name={`pages.${index}.slug`}
                      defaultValue={item.slug}
                    />
                    <Field
                      label="Title"
                      name={`pages.${index}.title`}
                      defaultValue={item.title}
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="Description"
                      name={`pages.${index}.description`}
                      defaultValue={item.description}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            <SaveButton label="Save age landing pages" />
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
