export type Guide = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  /** Related internal links shown on the guide */
  links: { label: string; href: string }[];
  sections: { heading: string; body: string }[];
};

/** Static SEO guides — expand or move to CMS later. */
export const GUIDES: Guide[] = [
  {
    slug: "anker-earbuds-price-sri-lanka",
    title: "Anker Earbuds Price in Sri Lanka (2026)",
    description:
      "Current Anker Soundcore earbuds prices in Sri Lanka at iCrowd — compare models, warranty, and pickup in Kandy, Kottawa & Matara.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Earbuds category", href: "/categories/earbuds" },
      { label: "Contact / WhatsApp", href: "/contact" },
    ],
    sections: [
      {
        heading: "Why buy Anker earbuds in Sri Lanka from iCrowd?",
        body: "Anker Soundcore earbuds are popular for battery life and value. At iCrowd you get genuine products, clear LKR pricing, island-wide delivery, and pickup options in Kandy, Kottawa, and Matara.",
      },
      {
        heading: "How pricing works",
        body: "Prices change with stock and promotions. Open any Anker earbuds product page for the live price in Sri Lanka, availability, and warranty details. Use our Anker brand page to compare models side by side.",
      },
      {
        heading: "Pickup & delivery",
        body: "Order online and collect at Kottawa or Matara pickup points, visit the Kandy shop, or choose island-wide courier delivery at checkout.",
      },
    ],
  },
  {
    slug: "iphone-price-sri-lanka",
    title: "iPhone Price in Sri Lanka — Buy at iCrowd",
    description:
      "Check iPhone prices in Sri Lanka at iCrowd. Genuine Apple iPhones with island-wide delivery and a shop in Kandy.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Shop phones", href: "/categories/phones" },
      { label: "Apple brand", href: "/products/brands/apple" },
      { label: "Kandy shop", href: "/locations/kandy" },
    ],
    sections: [
      {
        heading: "Buy iPhones in Sri Lanka",
        body: "Looking for iPhone price in Sri Lanka? Browse our phones category for current LKR prices, storage options, and warranty. Visit our Kandy shop for in-person advice or order for delivery anywhere in Sri Lanka.",
      },
      {
        heading: "Kandy iPhones",
        body: "Customers searching for iPhones in Kandy can visit our full shop, check stock, and pick up the same day when available — or arrange delivery to your address.",
      },
    ],
  },
  {
    slug: "best-dji-drones-sri-lanka",
    title: "Best DJI Drones in Sri Lanka",
    description:
      "Shop DJI drones and gimbals in Sri Lanka at iCrowd — prices, recommendations, delivery and pickup.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Shop DJI", href: "/products/brands/dji" },
      { label: "Drones category", href: "/categories/drones" },
      { label: "FAQ", href: "/faq" },
    ],
    sections: [
      {
        heading: "DJI drones for Sri Lanka flyers",
        body: "Whether you want a travel drone or a more advanced DJI model, iCrowd stocks genuine DJI products with local pricing in LKR. Check each product page for specs, stock, and warranty.",
      },
      {
        heading: "Buying tips",
        body: "Match the drone to your use case (travel, content, or pro). Message us on WhatsApp if you need a recommendation. We deliver island-wide and offer pickup in Kandy, Kottawa, and Matara.",
      },
    ],
  },
  {
    slug: "anker-chargers-sri-lanka",
    title: "Anker Chargers & Power Banks in Sri Lanka",
    description:
      "Anker chargers and power banks in Sri Lanka — prices at iCrowd with delivery and Kottawa / Matara / Kandy pickup.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Chargers", href: "/categories/chargers" },
      { label: "Power banks", href: "/categories/powerbanks" },
    ],
    sections: [
      {
        heading: "Anker in Sri Lanka",
        body: "Anker is one of the most trusted accessory brands for fast charging and portable power. Browse our Anker hub for chargers, power banks, hubs and cables with clear Sri Lanka pricing.",
      },
      {
        heading: "Kottawa Anker pickup",
        body: "Ordered Anker gear near Colombo? Use our Kottawa pickup point after checkout, or visit the Kandy shop for a wider selection.",
      },
    ],
  },
  {
    slug: "buy-iphone-kandy",
    title: "Buy iPhone in Kandy — iCrowd Shop",
    description:
      "Buy iPhones in Kandy at the iCrowd shop. Genuine Apple products, expert help, and island-wide delivery across Sri Lanka.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Kandy location", href: "/locations/kandy" },
      { label: "Phones", href: "/categories/phones" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        heading: "iPhone shop in Kandy",
        body: "iCrowd’s Kandy store is our full shop for Apple iPhones and accessories. Check live prices online, then visit for pickup or order delivery to your door.",
      },
      {
        heading: "Same-day pickup when in stock",
        body: "Message us before you visit to confirm stock. You can also order online and collect at the Kandy shop.",
      },
    ],
  },
  {
    slug: "anker-kottawa-pickup",
    title: "Anker Pickup in Kottawa",
    description:
      "Order Anker products online and pick up in Kottawa — chargers, earbuds, power banks and more from iCrowd Sri Lanka.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Kottawa pickup", href: "/locations/kottawa" },
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        heading: "Collect Anker orders in Kottawa",
        body: "Place your order on icrowd.lk, choose pickup, and collect at our Kottawa point. Ideal if you searched for Anker near Kottawa or need chargers and earbuds without waiting for courier delivery.",
      },
    ],
  },
  {
    slug: "earbuds-matara",
    title: "Earbuds in Matara — Buy & Pickup",
    description:
      "Buy earbuds in Matara via iCrowd pickup — Anker Soundcore and more, with island-wide delivery across Sri Lanka.",
    updatedAt: "2026-08-02",
    links: [
      { label: "Matara pickup", href: "/locations/matara" },
      { label: "Earbuds", href: "/categories/earbuds" },
      { label: "Anker", href: "/products/brands/anker" },
    ],
    sections: [
      {
        heading: "Matara earbuds pickup",
        body: "Shop earbuds online at Sri Lanka prices, then pick up in Matara or request delivery. Browse the earbuds category for current models and LKR pricing.",
      },
    ],
  },
  {
    slug: "dji-sri-lanka",
    title: "DJI Sri Lanka — Drones & Gimbals at iCrowd",
    description:
      "Buy DJI drones and gimbals in Sri Lanka from iCrowd. Prices in LKR, warranty info, delivery and store pickup.",
    updatedAt: "2026-08-02",
    links: [
      { label: "DJI brand", href: "/products/brands/dji" },
      { label: "Guides hub", href: "/guides" },
      { label: "Locations", href: "/locations" },
    ],
    sections: [
      {
        heading: "Official-channel DJI gear",
        body: "iCrowd sells genuine DJI products for the Sri Lanka market. Compare drones and gimbals on our DJI brand page, then checkout for island-wide delivery or pickup in Kandy, Kottawa, or Matara.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function listGuides(): Guide[] {
  return GUIDES;
}
