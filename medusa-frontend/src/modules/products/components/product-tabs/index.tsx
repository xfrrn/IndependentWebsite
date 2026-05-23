"use client"

import { HttpTypes } from "@medusajs/types"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"

type ProductTabContent = {
  productInformationLabel: string
  shippingReturnsLabel: string
  materialLabel: string
  countryOfOriginLabel: string
  typeLabel: string
  weightLabel: string
  dimensionsLabel: string
  fastDeliveryTitle: string
  fastDeliveryBody: string
  simpleExchangesTitle: string
  simpleExchangesBody: string
  easyReturnsTitle: string
  easyReturnsBody: string
}

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  content?: ProductTabContent
}

const ProductTabs = ({ product, content }: ProductTabsProps) => {
  const tabs = [
    {
      label: content?.productInformationLabel || "Product Information",
      component: <ProductInfoTab product={product} content={content} />,
    },
    {
      label: content?.shippingReturnsLabel || "Shipping & Returns",
      component: <ShippingInfoTab content={content} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product, content }: ProductTabsProps) => {
  return (
    <div className="py-8 text-small-regular">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">
              {content?.materialLabel || "Material"}
            </span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">
              {content?.countryOfOriginLabel || "Country of origin"}
            </span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{content?.typeLabel || "Type"}</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">
              {content?.weightLabel || "Weight"}
            </span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">
              {content?.dimensionsLabel || "Dimensions"}
            </span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = ({
  content,
}: {
  content?: ProductTabContent
}) => {
  return (
    <div className="py-8 text-small-regular">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">
              {content?.fastDeliveryTitle || "Fast delivery"}
            </span>
            <p className="max-w-sm">
              {content?.fastDeliveryBody ||
                "Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home."}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">
              {content?.simpleExchangesTitle || "Simple exchanges"}
            </span>
            <p className="max-w-sm">
              {content?.simpleExchangesBody ||
                "Is the fit not quite right? No worries - we'll exchange your product for a new one."}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">
              {content?.easyReturnsTitle || "Easy returns"}
            </span>
            <p className="max-w-sm">
              {content?.easyReturnsBody ||
                "Just return your product and we'll refund your money. No questions asked - we'll do our best to make sure your return is hassle-free."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
