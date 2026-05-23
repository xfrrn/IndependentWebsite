export type MarketingNavLink = {
  label: string
  href: string
  description?: string
}

export type MarketingNavGroup = {
  title: string
  links: MarketingNavLink[]
}

export type MarketingNavItem = {
  label: string
  href?: string
  groups?: MarketingNavGroup[]
}

export const ANNOUNCEMENT = {
  text: "New Year Sale: Spend $350 to get $40 off plus free shipping.",
  ctaLabel: "See details",
  href: "/shop/scenario/shipping",
}

export const BRAND_NAME = "KID GOFUN"

const emailAddress = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""

export const HEADER_LINKS = [
  {
    label: "Email",
    detail: emailAddress || "Set contact email",
    href: emailAddress ? `mailto:${emailAddress}` : "#",
  },
  {
    label: "WeChat",
    detail: "Chat now",
    href: process.env.NEXT_PUBLIC_WECHAT_URL || "#",
  },
  {
    label: "WhatsApp",
    detail: "Chat now",
    href: process.env.NEXT_PUBLIC_WHATSAPP_URL || "#",
  },
]

export const HEADER_CONTENT = {
  brandName: BRAND_NAME,
  searchAriaLabel: "Search",
  searchPlaceholder: "Search by age, grade, or category",
  mobileMenuLabel: "Menu",
  links: HEADER_LINKS,
}

export const MARKETING_NAV: MarketingNavItem[] = [
  { label: "ALL PRODUCTS", href: "/products" },
  {
    label: "CATEGORY",
    groups: [
      {
        title: "Category",
        links: [
          { label: "Building Toys", href: "/shop/category/building" },
          { label: "Sensory Play", href: "/shop/category/sensory" },
          { label: "Puzzles", href: "/shop/category/puzzles" },
          { label: "STEM Learning", href: "/shop/category/stem" },
          { label: "Pretend Play", href: "/shop/category/pretend" },
          { label: "Travel Toys", href: "/shop/category/travel" },
        ],
      },
    ],
  },
  { label: "HOT SELL", href: "/shop/scenario/featured" },
  {
    label: "AGE",
    groups: [
      {
        title: "Age",
        links: [
          { label: "0-24 Months", href: "/shop/age/0-24-months" },
          { label: "2-4 Years", href: "/shop/age/2-4-years" },
          { label: "5-7 Years", href: "/shop/age/5-7-years" },
          { label: "8-10 Years", href: "/shop/age/8-10-years" },
          { label: "11-13 Years", href: "/shop/age/11-13-years" },
          { label: "14+ Years", href: "/shop/age/14-plus-years" },
        ],
      },
    ],
  },
]

export const NAV_CONTENT = {
  mobileBrowseLabel: "Browse",
  mobileCloseLabel: "Close",
  exploreLabel: "Explore",
  megaMenuIntroLabelPrefix: "Browse",
  megaMenuIntroDescription: "Curated shortcuts to help families shop faster.",
  mobileGoToPrefix: "Go to",
  items: MARKETING_NAV,
}

export const HERO_IMAGE = {
  alt: "FritzS Learning hero",
  src:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=2000&q=80",
}

export const HERO_CONTENT = {
  eyebrow: "Featured",
  title: "Love Play,\nLearn.",
  body:
    "Thoughtfully selected toys for playful learning, everyday discovery, and joyful family moments.",
  primaryCtaLabel: "Discover All Products",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "View Toy",
  secondaryCtaHref: "/shop/scenario/featured",
  badgeLabel: "KID GOFUN",
  badgeText: "Bright ideas for curious little minds.",
}

export const BRAND_INTRO = {
  eyebrow: "Our approach",
  title: "Learning-led play, curated for real families",
  subtitle: "We focus on skill-building play that feels joyful and calm at home.",
  body: "Every pick is screened for clear age guidance, open-ended creativity, and materials parents can trust. Shop by age, grade, or category and find the right fit in minutes.",
  badge: "Ships in 1-2 Days",
  cta: "Explore Starter Favorites",
  ctaHref: "/shop/scenario/featured",
}

export const FEATURED_PRODUCTS = {
  eyebrow: "All Products",
  title: "All Products",
  subtitle: "Browse all learning tools.",
  strategy: "default" as const,
}

export const CATEGORY_PAGE_CONTENT = {
  eyebrow: "Category",
  emptyMessage:
    "No products tagged for this category yet. Add metadata.category_key to match this category.",
  pages: [
    {
      slug: "building",
      title: "Building Toys",
      description: "Construction toys that build confidence and focus.",
    },
    {
      slug: "sensory",
      title: "Sensory Play",
      description: "Textures and motion for calm discovery.",
    },
    {
      slug: "puzzles",
      title: "Puzzles",
      description: "Problem solving that feels fun, not frustrating.",
    },
    {
      slug: "stem",
      title: "STEM Learning",
      description: "Curiosity-led science and engineering play.",
    },
    {
      slug: "pretend",
      title: "Pretend Play",
      description: "Role play for storytelling and empathy.",
    },
    {
      slug: "travel",
      title: "Travel Toys",
      description: "Compact play for on-the-go moments.",
    },
  ],
}

export const AGE_PAGE_CONTENT = {
  eyebrow: "Shop by age",
  titlePrefix: "Ages ",
  emptyMessage:
    "No products tagged for this age yet. Add metadata.age_range to match this age group.",
  filters: [
    { label: "All", value: "all" },
    { label: "Building", value: "building" },
    { label: "Sensory", value: "sensory" },
    { label: "Puzzles", value: "puzzles" },
    { label: "STEM", value: "stem" },
    { label: "Pretend", value: "pretend" },
    { label: "Travel", value: "travel" },
  ],
  pages: [
    {
      slug: "0-24-months",
      title: "0-24 Months",
      description: "Gentle sensory discovery and early developmental play.",
    },
    {
      slug: "2-4-years",
      title: "2-4 Years",
      description: "Early imagination, movement, and hands-on exploration.",
    },
    {
      slug: "5-7-years",
      title: "5-7 Years",
      description: "Building focus, confidence, and creative problem solving.",
    },
    {
      slug: "8-10-years",
      title: "8-10 Years",
      description: "Independent learning tools for growing curious minds.",
    },
    {
      slug: "11-13-years",
      title: "11-13 Years",
      description: "More advanced challenges for deeper thinking and practice.",
    },
    {
      slug: "14-plus-years",
      title: "14+ Years",
      description: "Advanced picks for teens and older learners.",
    },
  ],
}

export const PRODUCTS_PAGE_CONTENT = {
  eyebrow: "Products",
  defaultTitle: "All products",
  searchTitlePrefix: 'Search results for "',
  searchTitleSuffix: '"',
  defaultDescription: "Browse by age, category, or scenario from the homepage.",
  searchResultsLabelPrefix: "Showing ",
  searchResultsLabelSuffix: " results.",
  homeLabel: "Home",
  emptyMessage: "No products match your search yet.",
}

export const PRODUCT_UI_CONTENT = {
  addToCartLabel: "Add to cart",
  selectVariantLabel: "Select variant",
  outOfStockLabel: "Out of stock",
  selectOptionsLabel: "Select Options",
  viewDetailsLabel: "View details",
  agePrefix: "Age ",
  agesPrefix: "Ages ",
  noImageLabel: "No Image",
  fallbackDescription: "Age-appropriate play with clear guidance for parents.",
  productInformationLabel: "Product Information",
  shippingReturnsLabel: "Shipping & Returns",
  materialLabel: "Material",
  countryOfOriginLabel: "Country of origin",
  typeLabel: "Type",
  weightLabel: "Weight",
  dimensionsLabel: "Dimensions",
  fastDeliveryTitle: "Fast delivery",
  fastDeliveryBody:
    "Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.",
  simpleExchangesTitle: "Simple exchanges",
  simpleExchangesBody:
    "Is the fit not quite right? No worries - we'll exchange your product for a new one.",
  easyReturnsTitle: "Easy returns",
  easyReturnsBody:
    "Just return your product and we'll refund your money. No questions asked - we'll do our best to make sure your return is hassle-free.",
}

export const COLLECTION_SPOTLIGHT = {
  eyebrow: "Collections",
  title: "Curated play paths",
  subtitle: "Browse by intention instead of endless scrolling.",
  items: [
    {
      title: "Calm Focus",
      description: "Quiet, tactile toys for deep concentration.",
      href: "/shop/category/sensory",
      tag: "Sensory",
    },
    {
      title: "Builders Club",
      description: "Construction sets that grow with confidence.",
      href: "/shop/category/building",
      tag: "Building",
    },
    {
      title: "Story & Role Play",
      description: "Pretend play for empathy and language.",
      href: "/shop/category/pretend",
      tag: "Pretend",
    },
    {
      title: "STEM Starters",
      description: "Early science and engineering discoveries.",
      href: "/shop/category/stem",
      tag: "STEM",
    },
    {
      title: "Puzzle Corner",
      description: "Problem-solving that feels fun, not forced.",
      href: "/shop/category/puzzles",
      tag: "Puzzles",
    },
    {
      title: "Travel Ready",
      description: "Compact kits for on-the-go learning.",
      href: "/shop/category/travel",
      tag: "Travel",
    },
  ],
}

export const CATEGORY_HIGHLIGHTS = {
  eyebrow: "Category",
  title: "Shop by category",
  subtitle: "Explore product categories and find the learning style that fits best.",
  items: [
    {
      title: "Building Toys",
      description: "Construction sets and hands-on tools that build focus and confidence.",
      ctaLabel: "Learn More",
      href: "/shop/category/building",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Sensory Play",
      description: "Textures, movement, and calming play experiences for curious kids.",
      ctaLabel: "Learn More",
      href: "/shop/category/sensory",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Puzzles",
      description: "Problem-solving activities designed to feel engaging, not overwhelming.",
      ctaLabel: "Learn More",
      href: "/shop/category/puzzles",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "STEM Learning",
      description: "Science, engineering, and logic tools for discovery-led learning.",
      ctaLabel: "Learn More",
      href: "/shop/category/stem",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Pretend Play",
      description: "Role-play toys that support storytelling, empathy, and imagination.",
      ctaLabel: "Learn More",
      href: "/shop/category/pretend",
      image:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Travel Toys",
      description: "Compact learning toys that are easy to take on the go.",
      ctaLabel: "Learn More",
      href: "/shop/category/travel",
      image:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80",
    },
  ],
}

export const AGE_HIGHLIGHTS = {
  eyebrow: "Age",
  title: "Shop by age",
  subtitle: "Pick the right age range and jump straight into the matching products.",
  items: [
    {
      value: "0-24",
      unit: "Months",
      title: "0-24 Months",
      href: "/shop/age/0-24-months",
    },
    {
      value: "2-4",
      unit: "Years",
      title: "2-4 Years",
      href: "/shop/age/2-4-years",
    },
    {
      value: "5-7",
      unit: "Years",
      title: "5-7 Years",
      href: "/shop/age/5-7-years",
    },
    {
      value: "8-10",
      unit: "Years",
      title: "8-10 Years",
      href: "/shop/age/8-10-years",
    },
    {
      value: "11-13",
      unit: "Years",
      title: "11-13 Years",
      href: "/shop/age/11-13-years",
    },
    {
      value: "14+",
      unit: "Years",
      title: "14+ Years",
      href: "/shop/age/14-plus-years",
    },
  ],
}

export const BLOG_HIGHLIGHTS = {
  eyebrow: "From the blog",
  title: "Guides for thoughtful play",
  subtitle: "Tips, activity ideas, and parent-tested picks.",
  posts: [
    {
      title: "How to choose toys by age without overwhelm",
      excerpt: "A quick checklist for matching play styles to the right stage.",
      href: "/blog/how-to-choose-toys",
      date: "Jan 15, 2026",
    },
    {
      title: "5 calm-time activities for rainy afternoons",
      excerpt: "Low-mess ideas that keep curious minds engaged.",
      href: "/blog/calm-time-activities",
      date: "Feb 2, 2026",
    },
    {
      title: "Building a STEM shelf at home",
      excerpt: "Simple ways to encourage problem-solving each week.",
      href: "/blog/stem-shelf",
      date: "Feb 18, 2026",
    },
  ],
}

export const LEARNING_TOOLS_SPOTLIGHT = {
  title: "Learning tools for playful growth",
  items: [
    {
      title: "Fine Motor Skills",
      description: "Small muscle coordination and playful practice.",
      href: "/shop/category/fine-motor",
      tag: "Category",
    },
    {
      title: "How U Feel庐 Dial Your Feeling Chat",
      description: "Emotion learning tool for mindful conversations.",
      href: "/products/how-u-feel",
      tag: "Product",
    },
    {
      title: "New",
      description: "New FritzS Learning educational toys.",
      href: "/products?sort=created_at",
      tag: "Collection",
    },
  ],
}

export const PROMO_HERO = {
  videoSrc: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  posterSrc:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1800&q=80",
  eyebrow: "Featured",
  title: "MAGSHUTO",
  body: "A magnetic building set that sparks calm, creative focus.",
  ctaLabel: "View Toy",
  ctaHref: "/shop/scenario/featured",
}

export const FOOTER_CONTENT = {
  brandName: "KID GOFUN",
  websiteLabel: "www.kidgofun.com",
  websiteHref: "https://www.kidgofun.com",
  contactLabel: "Contact: +86 15575725092",
  contactHref: "tel:+8615575725092",
  socialLinks: [
    {
      label: "WeChat",
      href: process.env.NEXT_PUBLIC_WECHAT_URL || "#",
    },
    {
      label: "WhatsApp",
      href: process.env.NEXT_PUBLIC_WHATSAPP_URL || "#",
    },
    {
      label: "Facebook",
      href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    },
    {
      label: "Instagram",
      href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    },
  ],
}

export const FOOTER_LINKS = {
  quickLinks: [
    { label: "All Products", href: "/products" },
    { label: "Best Sellers", href: "/shop/scenario/featured" },
    { label: "New Arrivals", href: "/products?sort=created_at" },
    { label: "Blog", href: "/blog" },
  ],
  about: [
    { label: "FritzS Story", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  missionText:
    "We provide toys that help parents connect to their children and tools that help teachers connect to their students. Let FritzS Learning products decorate your home and classroom, making learning more interesting and exciting!",
  shipping: [
    { label: "Shipping & Returns", href: "/shop/scenario/shipping" },
    { label: "Order Tracking", href: "/account/orders" },
    { label: "Gift Services", href: "/collections/gift-ready" },
  ],
  shippingText:
    "Free shipping for Hong Kong purchase upon $100. SF Express free shipping (min $100). Ships in about two working days. Free shipping for purchase over NTD380 in Taiwan.",
  countries: ["China (CNY 楼)", "Hong Kong SAR (HKD $)", "Macao SAR (MOP P)", "Taiwan (TWD $)"],
  payment: ["Apple Pay", "Google Pay", "Mastercard", "PayPal", "Shop Pay", "Union Pay", "Visa"],
}
