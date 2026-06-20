import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const COUNTRIES = [
  { iso_2: "gb", iso_3: "gbr", name: "United Kingdom", display_name: "United Kingdom" },
  { iso_2: "de", iso_3: "deu", name: "Germany", display_name: "Germany" },
  { iso_2: "dk", iso_3: "dnk", name: "Denmark", display_name: "Denmark" },
  { iso_2: "se", iso_3: "swe", name: "Sweden", display_name: "Sweden" },
  { iso_2: "fr", iso_3: "fra", name: "France", display_name: "France" },
  { iso_2: "es", iso_3: "esp", name: "Spain", display_name: "Spain" },
  { iso_2: "it", iso_3: "ita", name: "Italy", display_name: "Italy" },
]

const CATEGORIES = [
  { name: "Building Toys", handle: "building" },
  { name: "Sensory Play", handle: "sensory" },
  { name: "Puzzles", handle: "puzzles" },
  { name: "STEM Learning", handle: "stem" },
  { name: "Pretend Play", handle: "pretend" },
  { name: "Travel Toys", handle: "travel" },
]

const PRODUCTS = [
  {
    title: "Medusa T-Shirt",
    handle: "t-shirt",
    description: "Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.",
    thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    images: [
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png" },
    ],
    metadata: { age_range: "5-7 years", scenario_keys: "featured|gifts" },
    categoryHandle: "building",
    variants: [
      { title: "S / Black", sku: "SHIRT-S-BLACK", options: { Size: "S", Color: "Black" } },
      { title: "S / White", sku: "SHIRT-S-WHITE", options: { Size: "S", Color: "White" } },
      { title: "M / Black", sku: "SHIRT-M-BLACK", options: { Size: "M", Color: "Black" } },
      { title: "M / White", sku: "SHIRT-M-WHITE", options: { Size: "M", Color: "White" } },
      { title: "L / Black", sku: "SHIRT-L-BLACK", options: { Size: "L", Color: "Black" } },
      { title: "L / White", sku: "SHIRT-L-WHITE", options: { Size: "L", Color: "White" } },
      { title: "XL / Black", sku: "SHIRT-XL-BLACK", options: { Size: "XL", Color: "Black" } },
      { title: "XL / White", sku: "SHIRT-XL-WHITE", options: { Size: "XL", Color: "White" } },
    ],
  },
  {
    title: "Medusa Sweatshirt",
    handle: "sweatshirt",
    description: "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
    thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    images: [
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png" },
    ],
    metadata: { age_range: "2-4 years", scenario_keys: "featured|quiet-time" },
    categoryHandle: "sensory",
    variants: [
      { title: "S", sku: "SWEATSHIRT-S", options: { Size: "S" } },
      { title: "M", sku: "SWEATSHIRT-M", options: { Size: "M" } },
      { title: "L", sku: "SWEATSHIRT-L", options: { Size: "L" } },
      { title: "XL", sku: "SWEATSHIRT-XL", options: { Size: "XL" } },
    ],
  },
  {
    title: "Medusa Sweatpants",
    handle: "sweatpants",
    description: "Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.",
    thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    images: [
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png" },
    ],
    metadata: { age_range: "8-10 years", scenario_keys: "featured" },
    categoryHandle: "puzzles",
    variants: [
      { title: "S", sku: "SWEATPANTS-S", options: { Size: "S" } },
      { title: "M", sku: "SWEATPANTS-M", options: { Size: "M" } },
      { title: "L", sku: "SWEATPANTS-L", options: { Size: "L" } },
      { title: "XL", sku: "SWEATPANTS-XL", options: { Size: "XL" } },
    ],
  },
  {
    title: "Medusa Shorts",
    handle: "shorts",
    description: "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.",
    thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
    images: [
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png" },
      { url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png" },
    ],
    metadata: { age_range: "0-24 months", scenario_keys: "featured|travel" },
    categoryHandle: "travel",
    variants: [
      { title: "S", sku: "SHORTS-S", options: { Size: "S" } },
      { title: "M", sku: "SHORTS-M", options: { Size: "M" } },
      { title: "L", sku: "SHORTS-L", options: { Size: "L" } },
      { title: "XL", sku: "SHORTS-XL", options: { Size: "XL" } },
    ],
  },
]

const EUR_PRICE = 10
const USD_PRICE = 15

async function seed() {
  console.log("Seeding database...")

  // Region
  const region = await prisma.region.upsert({
    where: { id: "region-europe" },
    update: {},
    create: {
      id: "region-europe",
      name: "Europe",
      currencyCode: "eur",
      countries: COUNTRIES,
      automaticTaxes: true,
    },
  })
  console.log(`Created region: ${region.name}`)

  // Categories
  const categoryMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { handle: cat.handle },
      update: {},
      create: {
        name: cat.name,
        handle: cat.handle,
        isActive: true,
      },
    })
    categoryMap[cat.handle] = created.id
    console.log(`Created category: ${cat.name}`)
  }

  // Products + variants
  for (const product of PRODUCTS) {
    const categoryId = categoryMap[product.categoryHandle]
    if (!categoryId) {
      console.error(`Category not found: ${product.categoryHandle}`)
      continue
    }

    const existing = await prisma.product.findUnique({ where: { handle: product.handle } })
    if (existing) {
      console.log(`Product already exists: ${product.title}`)
      continue
    }

    const created = await prisma.product.create({
      data: {
        handle: product.handle,
        title: product.title,
        description: product.description,
        thumbnail: product.thumbnail,
        images: product.images,
        metadata: product.metadata,
        tags: [],
        status: "published",
        weight: 400,
        categories: {
          create: { categoryId },
        },
        variants: {
          createMany: {
            data: product.variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              inventoryQuantity: 100,
              options: v.options,
              calculatedPrice: {
                calculated_amount: EUR_PRICE * 100,
                original_amount: EUR_PRICE * 100,
                currency_code: "eur",
                calculated_price: { price_list_type: "default" },
              },
              images: [],
            })),
          },
        },
      },
    })
    console.log(`Created product: ${created.title} (${product.variants.length} variants)`)
  }

  console.log("Seeding complete!")
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
