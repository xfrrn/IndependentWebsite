const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const pageFiles = [
  "src/app/[countryCode]/(main)/shop/category/[slug]/page.tsx",
  "src/app/[countryCode]/(main)/shop/age/[slug]/page.tsx",
  "src/app/[countryCode]/(main)/shop/scenario/[slug]/page.tsx",
  "src/app/[countryCode]/(main)/products/page.tsx",
]

const fieldsSource = fs.readFileSync(
  path.join(root, "src/lib/data/product-fields.ts"),
  "utf8"
)

const requiredFields = [
  "id",
  "handle",
  "title",
  "subtitle",
  "description",
  "thumbnail",
  "images",
  "metadata",
  "tags",
  "*variants.calculated_price",
]

for (const field of requiredFields) {
  if (!fieldsSource.includes(field)) {
    throw new Error(`PRODUCT_LIST_FIELDS is missing ${field}`)
  }
}

for (const relativePath of pageFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8")

  if (!source.includes("PRODUCT_LIST_FIELDS")) {
    throw new Error(`${relativePath} does not use PRODUCT_LIST_FIELDS`)
  }
}
