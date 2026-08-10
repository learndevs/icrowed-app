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
    updatedAt: "2026-08-03",
    links: [
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Earbuds category", href: "/categories/earbuds" },
      { label: "Contact / WhatsApp", href: "/contact" },
    ],
    sections: [
      {
        heading: "Why buy Anker earbuds in Sri Lanka from iCrowd?",
        body: "Anker Soundcore earbuds are some of the most searched audio products in Sri Lanka, and for good reason — the Soundcore line balances battery life, call quality and price better than most competing brands at the same budget. At iCrowd every Anker earbud we list is a genuine, authorised-channel product, not a grey-market import, so you get the warranty coverage Anker intends for the model. Pricing is shown in LKR on every product page, updated as stock and promotions change, so what you see is what you pay at checkout.",
      },
      {
        heading: "Anker Soundcore R50i, R60i NC and Liberty series — how to choose",
        body: "The entry-level Soundcore R-series (R50i, R60i NC) suits everyday commuting and calls, with the 'NC' models adding active noise cancellation for buses, trains and open offices. Step up to the Liberty 4 NC or Liberty 5 ANC if you want stronger noise cancellation, spatial audio, and longer battery life for flights or long work sessions. If you mainly listen at the gym, the P-series (P20i, P30i, P40i) trades some noise cancellation for a lighter, sweat-resistant fit. Match the model to how you'll actually use it rather than buying the most expensive option by default.",
      },
      {
        heading: "How pricing works",
        body: "Prices change with stock levels, exchange rates and Anker's own promotions, so we keep the live price on each product page rather than a fixed printed list. Open any Anker earbuds product page for the current price in Sri Lanka, real-time stock, and the exact warranty period for that model. Use our Anker brand page to compare every model side by side by price, from the most affordable R-series up to the noise-cancelling Liberty range.",
      },
      {
        heading: "Pickup & delivery",
        body: "Order online and collect at our Kottawa or Matara pickup points, visit the Kandy shop to try before you buy, or choose island-wide courier delivery at checkout. Delivery charges and estimated timelines are shown before you pay, and pickup orders are usually ready within a day of confirmation — message us on WhatsApp to arrange a time.",
      },
    ],
  },
  {
    slug: "iphone-price-sri-lanka",
    title: "iPhone Price in Sri Lanka — Buy at iCrowd",
    description:
      "Check iPhone prices in Sri Lanka at iCrowd. Genuine Apple iPhones with island-wide delivery and a shop in Kandy.",
    updatedAt: "2026-08-03",
    links: [
      { label: "iPhone price list", href: "/iphone-price-sri-lanka" },
      { label: "Shop phones", href: "/categories/phones" },
      { label: "Apple brand", href: "/products/brands/apple" },
      { label: "Kandy shop", href: "/locations/kandy" },
    ],
    sections: [
      {
        heading: "Buy iPhones in Sri Lanka",
        body: "Looking for the iPhone price in Sri Lanka? Our dedicated iPhone price list shows every current model with live LKR pricing, storage options and stock, updated as prices change. Browse the phones category for the full range, or the Apple brand page to see iPhones alongside iPads, MacBooks and AirPods from the same seller. Every iPhone is genuine and comes with warranty details listed on its product page — nothing is grey-market or reconditioned unless clearly stated.",
      },
      {
        heading: "Which iPhone and storage size should you buy?",
        body: "Storage is usually the biggest price difference between two otherwise identical iPhones, so it's worth thinking about before you buy. 128GB suits light users who lean on cloud storage for photos; 256GB is the comfortable middle ground for most people; and 512GB or 1TB makes sense if you shoot a lot of video or keep a large offline media library. If budget is the main constraint, last year's Pro model often beats this year's standard model on cameras and build quality for a similar price — compare specs on the product page before deciding.",
      },
      {
        heading: "Kandy iPhones",
        body: "Customers searching for iPhones in Kandy can visit our full shop, check stock in person, and pick up the same day when the model and colour you want is available — or arrange delivery to your address instead. Our Kandy team can also advise on trade-in style upgrades, case and accessory pairing, and which AppleCare or local warranty option applies to your purchase.",
      },
      {
        heading: "Payment, warranty and delivery",
        body: "We accept card payment and bank deposit, with orders confirmed once payment is verified. Every iPhone ships with its stated manufacturer warranty, and delivery is island-wide across Sri Lanka with tracking provided after dispatch. If you're not near Kandy, Kottawa or Matara, courier delivery is the fastest way to get a new iPhone — check the exact delivery estimate for your district at checkout.",
      },
    ],
  },
  {
    slug: "best-dji-drones-sri-lanka",
    title: "Best DJI Drones in Sri Lanka",
    description:
      "Shop DJI drones and gimbals in Sri Lanka at iCrowd — prices, recommendations, delivery and pickup.",
    updatedAt: "2026-08-03",
    links: [
      { label: "Shop DJI", href: "/products/brands/dji" },
      { label: "Drones category", href: "/categories/drones" },
      { label: "FAQ", href: "/faq" },
    ],
    sections: [
      {
        heading: "DJI drones for Sri Lanka flyers",
        body: "Whether you want a lightweight travel drone or a more advanced model for professional shoots, iCrowd stocks genuine DJI products with local LKR pricing and manufacturer warranty. DJI remains the dominant drone brand in Sri Lanka because of its combination of flight stability, camera quality and beginner-friendly software — but the right model depends heavily on what you're shooting and your budget, not just which one is newest.",
      },
      {
        heading: "Neo, Mini and Air — which DJI drone fits your use case",
        body: "The DJI Neo and Mini series are the easiest entry points: light enough to fly with minimal registration hassle, and small enough to travel with daily. Step up to the Air series if you want a larger sensor and better low-light footage while still keeping the drone reasonably portable. The Mavic and Pro-tier models are aimed at commercial or serious hobbyist use — better cameras, longer range and more advanced obstacle avoidance, at a proportionally higher price. Match the tier to your actual shooting needs rather than defaulting to the most expensive option.",
      },
      {
        heading: "Gimbals and accessories",
        body: "Beyond drones, DJI's Osmo gimbal line is popular in Sri Lanka for smartphone and action-camera stabilisation, useful for creators who want smooth handheld footage without a full drone setup. Check compatibility with your phone or camera model on the product page before ordering, and consider a spare battery or extra propellers if you're planning to fly frequently.",
      },
      {
        heading: "Buying tips",
        body: "Match the drone to your use case — travel, content creation, or professional work — rather than chasing specs you won't use. Message us on WhatsApp if you need a recommendation for a specific budget or shoot type. We deliver island-wide and offer pickup in Kandy, Kottawa, and Matara, with every DJI product backed by manufacturer warranty.",
      },
    ],
  },
  {
    slug: "anker-chargers-sri-lanka",
    title: "Anker Chargers & Power Banks in Sri Lanka",
    description:
      "Anker chargers and power banks in Sri Lanka — prices at iCrowd with delivery and Kottawa / Matara / Kandy pickup.",
    updatedAt: "2026-08-03",
    links: [
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Chargers", href: "/categories/chargers" },
      { label: "Power banks", href: "/categories/powerbanks" },
    ],
    sections: [
      {
        heading: "Anker in Sri Lanka",
        body: "Anker is one of the most trusted accessory brands for fast charging and portable power, and it's consistently one of the most searched charging brands among Sri Lankan buyers. Browse our Anker hub for chargers, power banks, hubs and cables with clear Sri Lanka pricing — every listing shows current LKR price, wattage, and capacity so you can compare models at a glance instead of digging through spec sheets.",
      },
      {
        heading: "Choosing a power bank capacity and wattage",
        body: "For daily phone top-ups, a 10,000mAh power bank is usually enough and stays pocket-friendly; if you're charging a laptop or multiple devices on a trip, look at 20,000mAh or higher with PD (Power Delivery) fast charging support. Wattage matters as much as capacity — a higher-wattage Anker charger or power bank fills your phone in a fraction of the time of a basic 5W unit, which is worth the small price difference for anyone who charges on the go.",
      },
      {
        heading: "Chargers and cables",
        body: "Anker's GaN wall chargers pack more output into a smaller size than older charger designs, and a single multi-port charger can often replace two or three older bricks. If you're buying a charger for a newer iPhone or Android flagship, check the wattage against your device's fast-charging spec on the product page to make sure you're not overpaying for capability you won't use.",
      },
      {
        heading: "Kottawa Anker pickup",
        body: "Ordered Anker gear near Colombo? Use our Kottawa pickup point after checkout, or visit the Kandy shop for a wider selection and in-person advice. Matara customers can also arrange pickup — see the Matara location page for current pickup hours and how to book a collection time.",
      },
    ],
  },
  {
    slug: "buy-iphone-kandy",
    title: "Buy iPhone in Kandy — iPhone Shop Kandy | iCrowd",
    description:
      "iPhone shop in Kandy at iCrowd — buy iPhone 17, 17 Pro Max, 16 Pro Max and more. Genuine Apple, live LKR prices, same-day pickup when in stock, island-wide delivery.",
    updatedAt: "2026-08-09",
    links: [
      { label: "Kandy location", href: "/locations/kandy" },
      { label: "iPhone price list", href: "/iphone-price-sri-lanka" },
      { label: "Phones", href: "/categories/phones" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        heading: "iPhone shop in Kandy",
        body: "iCrowd's Kandy store is our full shop for Apple iPhones and accessories — not just a pickup counter. You can see current models in person, compare colours and sizes side by side, and get advice from our team on storage size, trade-in style upgrades, and case or screen protector options before you buy. Check live prices online first using our iPhone price list, then visit for pickup or order delivery to your door.",
      },
      {
        heading: "What's usually in stock in Kandy",
        body: "Our Kandy shop typically carries the current-generation iPhone lineup across popular storage sizes, along with recent previous-generation models at lower prices for budget-conscious buyers. Stock on any specific colour or storage combination can move quickly, so it's worth checking the product page or messaging ahead if you have a particular configuration in mind.",
      },
      {
        heading: "Same-day pickup when in stock",
        body: "Message us before you visit to confirm stock on the exact model you want — this avoids a wasted trip if a particular colour or storage size has just sold out. You can also order online and collect at the Kandy shop the same day in many cases, which is often faster than waiting for courier delivery if you're already nearby.",
      },
      {
        heading: "Not in Kandy? We still deliver",
        body: "If you're outside Kandy, you don't need to travel — order online and choose island-wide delivery, or use our Kottawa or Matara pickup points if either is more convenient. Delivery timelines and charges are shown at checkout before you pay, so there are no surprises.",
      },
    ],
  },
  {
    slug: "anker-kottawa-pickup",
    title: "Anker Pickup in Kottawa",
    description:
      "Order Anker products online and pick up in Kottawa — chargers, earbuds, power banks and more from iCrowd Sri Lanka.",
    updatedAt: "2026-08-03",
    links: [
      { label: "Kottawa pickup", href: "/locations/kottawa" },
      { label: "Shop Anker", href: "/products/brands/anker" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        heading: "Collect Anker orders in Kottawa",
        body: "Place your order on icrowd.lk, choose pickup, and collect at our Kottawa point. This is ideal if you searched for Anker near Kottawa or need chargers, power banks and earbuds without waiting for courier delivery. Our Kottawa pickup point covers the full Anker range we carry — chargers, power banks, cables, hubs and Soundcore audio — so you're not limited to a smaller in-person selection.",
      },
      {
        heading: "How pickup works",
        body: "After checkout, you'll get confirmation once your order is ready for collection, usually within a day. Message us on WhatsApp to arrange a specific pickup time that works for your schedule, especially if you're coming straight from work or need an early or late slot.",
      },
      {
        heading: "Why choose pickup over delivery",
        body: "Pickup in Kottawa skips courier transit time entirely, which matters if you need a charger or power bank urgently — for a trip the next day, for example. It also lets you inspect the item and packaging before you leave, and ask any last questions about warranty or compatibility in person.",
      },
    ],
  },
  {
    slug: "earbuds-matara",
    title: "Earbuds in Matara — Buy & Pickup",
    description:
      "Buy earbuds in Matara via iCrowd pickup — Anker Soundcore and more, with island-wide delivery across Sri Lanka.",
    updatedAt: "2026-08-03",
    links: [
      { label: "Matara pickup", href: "/locations/matara" },
      { label: "Earbuds", href: "/categories/earbuds" },
      { label: "Anker", href: "/products/brands/anker" },
    ],
    sections: [
      {
        heading: "Matara earbuds pickup",
        body: "Shop earbuds online at Sri Lanka prices, then pick up in Matara or request delivery if that's more convenient. Browse the earbuds category for current models and LKR pricing across Anker Soundcore and other brands we carry — every listing shows live stock so you know before ordering whether your preferred model is available for pickup right away.",
      },
      {
        heading: "Choosing earbuds for everyday use vs. workouts",
        body: "If you mainly use earbuds for calls and commuting, a noise-cancelling model like the Soundcore R60i NC is worth the extra cost for quieter buses and offices. For gym and outdoor use, look at models with a secure fit and sweat resistance rather than maximum noise cancellation, since battery life and stability matter more than ANC in that setting.",
      },
      {
        heading: "Booking your Matara pickup",
        body: "After ordering, message us on WhatsApp or use the contact page to confirm a pickup time in Matara that suits you. Orders are usually ready for collection within a day, and if you change your mind about pickup, you can switch to island-wide delivery before your order ships.",
      },
    ],
  },
  {
    slug: "dji-sri-lanka",
    title: "DJI Sri Lanka — Drones & Gimbals at iCrowd",
    description:
      "Buy DJI drones and gimbals in Sri Lanka from iCrowd. Prices in LKR, warranty info, delivery and store pickup.",
    updatedAt: "2026-08-03",
    links: [
      { label: "DJI brand", href: "/products/brands/dji" },
      { label: "Best DJI drones guide", href: "/guides/best-dji-drones-sri-lanka" },
      { label: "Guides hub", href: "/guides" },
      { label: "Locations", href: "/locations" },
    ],
    sections: [
      {
        heading: "Official-channel DJI gear",
        body: "iCrowd sells genuine DJI products for the Sri Lanka market — drones, gimbals and related accessories — with pricing shown in LKR and warranty terms listed on every product page. Compare drones and gimbals on our DJI brand page, sorted so you can quickly see the full range from entry-level to professional, then checkout for island-wide delivery or pickup in Kandy, Kottawa, or Matara.",
      },
      {
        heading: "Registration and local flying rules",
        body: "Drone use in Sri Lanka is subject to local aviation regulations depending on weight class and where you plan to fly, so it's worth checking current requirements before your first flight, especially near airports, military areas, or crowded public spaces. Sticking to open areas with permission from the landowner is the simplest way to avoid issues while you're getting familiar with a new drone.",
      },
      {
        heading: "Support after you buy",
        body: "If you're unsure which DJI drone or gimbal suits your project, message us on WhatsApp with your intended use case — travel vlogging, real estate, events, or professional video — and we'll point you to the right tier. Warranty claims and accessory questions are handled the same way, so you always have a local point of contact rather than dealing with an overseas seller.",
      },
    ],
  },
  {
    slug: "ugreen-power-banks-sri-lanka",
    title: "UGREEN Power Bank Price in Sri Lanka",
    description:
      "UGREEN power bank and charger prices in Sri Lanka at iCrowd — Nexode, Uno and PB-series models compared, with delivery and pickup.",
    updatedAt: "2026-08-03",
    links: [
      { label: "Shop UGREEN", href: "/products/brands/ugreen" },
      { label: "Power banks", href: "/categories/powerbanks" },
      { label: "Chargers", href: "/categories/charging-adapters" },
    ],
    sections: [
      {
        heading: "Why UGREEN is worth comparing before you buy",
        body: "UGREEN has become one of the most searched charging brands in Sri Lanka, particularly by model number — buyers often already know they want a specific power bank like the PB526 or PB532 and just need the current LKR price. iCrowd stocks the UGREEN Nexode, Uno and PB-series power banks and chargers with live pricing and stock on every product page, so you can check the exact model you're after rather than a generic listing.",
      },
      {
        heading: "PB-series power banks — matching capacity to how you travel",
        body: "UGREEN's PB-series spans compact 10,000mAh units with a built-in cable for daily carry, up to 20,000mAh-plus models aimed at laptop charging on longer trips. If you're mainly topping up a phone between meetings, a 10,000mAh model with a built-in cable (no separate cable to lose) is the most convenient. For weekend trips or laptop charging, step up to a 20,000mAh PD model so a single power bank covers your phone and laptop without carrying two chargers.",
      },
      {
        heading: "Nexode and GaN chargers",
        body: "UGREEN's Nexode line uses GaN (gallium nitride) technology to pack higher wattage into a smaller charger body than older designs — useful if you're charging a MacBook or fast-charging Android phone and want one compact charger instead of the bulky brick that came in the box. Check the wattage listed on each product page against your device's maximum charging speed before buying, since a higher-wattage charger won't charge faster than your device supports.",
      },
      {
        heading: "Delivery and pickup",
        body: "All UGREEN products ship island-wide across Sri Lanka, with pickup also available at our Kandy shop and our Kottawa and Matara pickup points. Prices and stock are updated on each product page, so what you see when you order is the current price — message us on WhatsApp if you're comparing two specific models and want a recommendation.",
      },
    ],
  },
  {
    slug: "iphone-17-price-sri-lanka-update",
    title: "iPhone 17 Pro Max Price in Sri Lanka — 2026 Update",
    description:
      "iPhone 17 Pro Max price in Sri Lanka plus iPhone 17 and 17 Pro — live LKR pricing at iCrowd, storage options, Kandy shop pickup and island-wide delivery.",
    updatedAt: "2026-08-09",
    links: [
      { label: "iPhone price list", href: "/iphone-price-sri-lanka" },
      { label: "Apple brand", href: "/products/brands/apple" },
      { label: "Kandy shop", href: "/locations/kandy" },
    ],
    sections: [
      {
        heading: "iPhone 17 Pro Max price in Sri Lanka",
        body: "Searches for iPhone 17 Pro Max price in Sri Lanka and iPhone 16 Pro Max price in Sri Lanka are rising fast. This update covers current iPhone 17, iPhone 17 Pro and iPhone 17 Pro Max pricing in Sri Lanka at iCrowd, plus how they compare to the 16 series. Check the live iPhone price list for the exact current LKR price of each storage tier, since pricing can shift with stock and promotions through the month.",
      },
      {
        heading: "iPhone 17 vs iPhone 17 Pro vs iPhone 17 Pro Max — what actually changes",
        body: "The standard iPhone 17 covers most everyday needs well: strong performance, a good main and ultra-wide camera, and a lower price than the Pro line. Step up to the 17 Pro mainly for the telephoto zoom lens and a brighter, more durable display — useful if you photograph distant subjects often or use your phone outdoors in bright sunlight. The Pro Max adds a larger screen and bigger battery on top of the Pro's camera system, which suits users who prioritise battery life and media consumption over pocketability.",
      },
      {
        heading: "Is last year's iPhone still worth considering?",
        body: "If budget matters more than having the newest model, the previous generation is often a smart buy — it's typically discounted once a new iPhone launches, while still running the latest iOS updates for years. Compare the iPhone 16 series pricing on our phones category against the 17 series before deciding; the camera and performance gap between adjacent generations is usually smaller than the price difference.",
      },
      {
        heading: "Buying from iCrowd",
        body: "Every iPhone 17 model we list is genuine, with warranty details shown on the product page and live stock so you know availability before ordering. Visit our Kandy shop to see the lineup in person, or order online for island-wide delivery with pickup also available in Kottawa and Matara.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function listGuides(): Guide[] {
  // Cannibalizing slug permanently redirects to /iphone-price-sri-lanka — omit from hub/sitemap.
  return GUIDES.filter((g) => g.slug !== "iphone-price-sri-lanka");
}
