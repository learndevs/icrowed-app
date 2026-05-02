import * as dotenv from "dotenv";
import path from "path";
import { db } from "./db";
import {
  categories,
  brands,
  products,
  productImages,
  productVariants,
  offers,
  coupons,
} from "./schema";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Electronics",
    slug: "electronics",
    description: "Smart devices and everyday tech essentials.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=900&q=80",
    parentId: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Audio",
    slug: "audio",
    description: "Headphones, earbuds, and speakers for daily listening.",
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&h=900&q=80",
    parentId: "10000000-0000-4000-8000-000000000001",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Home Office",
    slug: "home-office",
    description: "Desk gear for focused work and study.",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&h=900&q=80",
    parentId: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Bags & Accessories",
    slug: "bags-accessories",
    description: "Commuter bags and useful carry goods.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=900&q=80",
    parentId: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "Wellness",
    slug: "wellness",
    description: "Hydration and personal care products.",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&h=900&q=80",
    parentId: null,
    isActive: true,
    sortOrder: 5,
  },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

const BRANDS = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Nova",
    slug: "nova",
    logoUrl: "https://dummyimage.com/240x120/111827/ffffff&text=Nova",
    isActive: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Orbit",
    slug: "orbit",
    logoUrl: "https://dummyimage.com/240x120/0f766e/ffffff&text=Orbit",
    isActive: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Lume",
    slug: "lume",
    logoUrl: "https://dummyimage.com/240x120/f59e0b/111827&text=Lume",
    isActive: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Atlas",
    slug: "atlas",
    logoUrl: "https://dummyimage.com/240x120/1d4ed8/ffffff&text=Atlas",
    isActive: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Sachi",
    slug: "sachi",
    logoUrl: "https://dummyimage.com/240x120/be123c/ffffff&text=Sachi",
    isActive: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    name: "Anker",
    slug: "anker",
    logoUrl: "/home/anker-logo.svg",
    isActive: true,
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    name: "Nova Airbuds Pro",
    slug: "nova-airbuds-pro",
    description: "Compact wireless earbuds with adaptive noise control, clear call microphones, and a pocketable charging case.",
    shortDescription: "Wireless earbuds with noise control.",
    categoryId: "10000000-0000-4000-8000-000000000002",
    brandId: "20000000-0000-4000-8000-000000000001",
    sku: "NVA-AIR-PRO",
    price: "18990",
    comparePrice: "22990",
    cost: "11200",
    stock: 42,
    lowStockThreshold: 8,
    isFeatured: true,
    isActive: true,
    specifications: { connectivity: "Bluetooth 5.3", battery: "28 hours with case", warranty: "1 year" },
    tags: ["audio", "wireless", "featured"],
    weight: "0.18",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    name: "Orbit Mini Bluetooth Speaker",
    slug: "orbit-mini-bluetooth-speaker",
    description: "A splash-resistant portable speaker with balanced sound for rooms, trips, and casual gatherings.",
    shortDescription: "Portable speaker with rich sound.",
    categoryId: "10000000-0000-4000-8000-000000000002",
    brandId: "20000000-0000-4000-8000-000000000002",
    sku: "ORB-SPK-MINI",
    price: "12990",
    comparePrice: "14990",
    cost: "7200",
    stock: 5,
    lowStockThreshold: 6,
    isFeatured: true,
    isActive: true,
    specifications: { battery: "16 hours", rating: "IPX5", input: "USB-C" },
    tags: ["audio", "speaker", "low-stock"],
    weight: "0.62",
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    name: "Atlas Metro Backpack",
    slug: "atlas-metro-backpack",
    description: "A structured daily backpack with a padded laptop sleeve, quick-access pocket, and water-resistant fabric.",
    shortDescription: "Laptop backpack for daily commutes.",
    categoryId: "10000000-0000-4000-8000-000000000004",
    brandId: "20000000-0000-4000-8000-000000000004",
    sku: "ATL-BAG-METRO",
    price: "15990",
    comparePrice: "18990",
    cost: "9300",
    stock: 28,
    lowStockThreshold: 5,
    isFeatured: true,
    isActive: true,
    specifications: { capacity: "22L", laptop: "15 inch", material: "Recycled polyester" },
    tags: ["bag", "commute", "laptop"],
    weight: "0.85",
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    name: "Lume Flex Desk Lamp",
    slug: "lume-flex-desk-lamp",
    description: "Adjustable LED desk lamp with three warmth settings, dimming, and a stable metal base.",
    shortDescription: "Adjustable LED desk lamp.",
    categoryId: "10000000-0000-4000-8000-000000000003",
    brandId: "20000000-0000-4000-8000-000000000003",
    sku: "LME-LMP-FLEX",
    price: "8990",
    comparePrice: "10990",
    cost: "4800",
    stock: 19,
    lowStockThreshold: 4,
    isFeatured: false,
    isActive: true,
    specifications: { brightness: "800 lumens", modes: "Warm, neutral, cool", power: "USB-C" },
    tags: ["desk", "lighting"],
    weight: "1.10",
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    name: "Sachi Gooseneck Kettle",
    slug: "sachi-gooseneck-kettle",
    description: "Precision-pour stainless steel kettle for tea and pour-over coffee at home.",
    shortDescription: "Stainless steel gooseneck kettle.",
    categoryId: "10000000-0000-4000-8000-000000000003",
    brandId: "20000000-0000-4000-8000-000000000005",
    sku: "SCH-KTL-GOOSE",
    price: "11990",
    comparePrice: "13990",
    cost: "6400",
    stock: 14,
    lowStockThreshold: 4,
    isFeatured: false,
    isActive: true,
    specifications: { capacity: "1L", material: "Stainless steel", handle: "Heat resistant" },
    tags: ["kitchen", "coffee"],
    weight: "0.95",
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    name: "Nova Fit Watch S2",
    slug: "nova-fit-watch-s2",
    description: "Lightweight fitness watch with heart-rate tracking, sleep insights, and a bright always-on display.",
    shortDescription: "Fitness watch with health tracking.",
    categoryId: "10000000-0000-4000-8000-000000000001",
    brandId: "20000000-0000-4000-8000-000000000001",
    sku: "NVA-WCH-S2",
    price: "24990",
    comparePrice: "29990",
    cost: "15200",
    stock: 0,
    lowStockThreshold: 5,
    isFeatured: false,
    isActive: true,
    specifications: { display: "1.43 inch AMOLED", battery: "7 days", sensors: "Heart rate, SpO2" },
    tags: ["fitness", "watch", "out-of-stock"],
    weight: "0.08",
  },
  {
    id: "30000000-0000-4000-8000-000000000007",
    name: "Lume Workspace Desk Mat",
    slug: "lume-workspace-desk-mat",
    description: "A smooth desk mat with stitched edges, soft texture, and enough room for keyboard and mouse.",
    shortDescription: "Large stitched desk mat.",
    categoryId: "10000000-0000-4000-8000-000000000003",
    brandId: "20000000-0000-4000-8000-000000000003",
    sku: "LME-MAT-WORK",
    price: "4990",
    comparePrice: null,
    cost: "2100",
    stock: 64,
    lowStockThreshold: 10,
    isFeatured: false,
    isActive: true,
    specifications: { size: "90 x 40 cm", surface: "Micro-weave cloth", backing: "Non-slip rubber" },
    tags: ["desk", "workspace"],
    weight: "0.45",
  },
  {
    id: "30000000-0000-4000-8000-000000000008",
    name: "Orbit Insulated Bottle",
    slug: "orbit-insulated-bottle",
    description: "Double-wall stainless steel bottle that keeps drinks cold through long commutes and warm afternoons.",
    shortDescription: "Insulated stainless steel bottle.",
    categoryId: "10000000-0000-4000-8000-000000000005",
    brandId: "20000000-0000-4000-8000-000000000002",
    sku: "ORB-BTL-BASE",
    price: "6490",
    comparePrice: "7490",
    cost: "3200",
    stock: 36,
    lowStockThreshold: 8,
    isFeatured: true,
    isActive: true,
    specifications: { material: "18/8 stainless steel", insulation: "Double wall", lid: "Leak resistant" },
    tags: ["wellness", "hydration"],
    weight: "0.34",
  },
  {
    id: "30000000-0000-4000-8000-000000000009",
    name: "Anker PowerLine III USB-C Cable (6 ft)",
    slug: "anker-powerline-iii-usbc-6ft",
    description: "Durable USB-C charging cable with reinforced connectors for phones, tablets, and laptops.",
    shortDescription: "Fast charging USB-C cable.",
    categoryId: "10000000-0000-4000-8000-000000000001",
    brandId: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-CBL-USBC6",
    price: "2290",
    comparePrice: "3490",
    cost: "950",
    stock: 120,
    lowStockThreshold: 15,
    isFeatured: false,
    isActive: true,
    specifications: { length: "6 ft", rating: "USB 2.0 data", jacket: "Double-braided nylon" },
    tags: ["anker", "cable", "usb-c"],
    weight: "0.06",
  },
  {
    id: "30000000-0000-4000-8000-000000000010",
    name: "Anker PowerCore 10000 Portable Charger",
    slug: "anker-powercore-10000",
    description: "Compact high-density power bank with USB-C and USB-A outputs for all-day backup power.",
    shortDescription: "10,000 mAh compact power bank.",
    categoryId: "10000000-0000-4000-8000-000000000001",
    brandId: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-PB-10K",
    price: "8490",
    comparePrice: "9990",
    cost: "4200",
    stock: 38,
    lowStockThreshold: 8,
    isFeatured: true,
    isActive: true,
    specifications: { capacity: "10000 mAh", ports: "USB-C + USB-A", input: "USB-C" },
    tags: ["anker", "power-bank", "charging"],
    weight: "0.22",
  },
  {
    id: "30000000-0000-4000-8000-000000000011",
    name: "Anker Soundcore P20i True Wireless Earbuds",
    slug: "anker-soundcore-p20i",
    description: "True wireless earbuds with punchy bass, clear calls, and long battery life in a pocketable case.",
    shortDescription: "True wireless earbuds with deep bass.",
    categoryId: "10000000-0000-4000-8000-000000000002",
    brandId: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-SCP-P20I",
    price: "13990",
    comparePrice: "16990",
    cost: "7800",
    stock: 55,
    lowStockThreshold: 10,
    isFeatured: true,
    isActive: true,
    specifications: { connectivity: "Bluetooth 5.3", battery: "30 hours with case", drivers: "10 mm" },
    tags: ["anker", "audio", "earbuds"],
    weight: "0.05",
  },
];

// ─── Product Images ───────────────────────────────────────────────────────────

const PRODUCT_IMAGES = [
  {
    id: "32000000-0000-4000-8000-000000000001",
    productId: "30000000-0000-4000-8000-000000000001",
    url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Nova Airbuds Pro case and earbuds",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000002",
    productId: "30000000-0000-4000-8000-000000000002",
    url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Orbit Mini Bluetooth Speaker",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000003",
    productId: "30000000-0000-4000-8000-000000000003",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Atlas Metro Backpack",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000004",
    productId: "30000000-0000-4000-8000-000000000004",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Lume Flex Desk Lamp",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000005",
    productId: "30000000-0000-4000-8000-000000000005",
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Sachi Gooseneck Kettle",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000006",
    productId: "30000000-0000-4000-8000-000000000006",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Nova Fit Watch S2",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000007",
    productId: "30000000-0000-4000-8000-000000000007",
    url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Lume Workspace Desk Mat",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000008",
    productId: "30000000-0000-4000-8000-000000000008",
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Orbit Insulated Bottle",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000009",
    productId: "30000000-0000-4000-8000-000000000009",
    url: "https://images.unsplash.com/photo-1583863788434-e58a363be820?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Anker USB-C cable",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000010",
    productId: "30000000-0000-4000-8000-000000000010",
    url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Anker portable charger",
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000011",
    productId: "30000000-0000-4000-8000-000000000011",
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&h=900&q=80",
    altText: "Anker Soundcore wireless earbuds",
    isPrimary: true,
    sortOrder: 1,
  },
];

// ─── Product Variants ─────────────────────────────────────────────────────────

const PRODUCT_VARIANTS = [
  {
    id: "31000000-0000-4000-8000-000000000001",
    productId: "30000000-0000-4000-8000-000000000001",
    name: "Matte Black",
    sku: "NVA-AIR-PRO-BLK",
    price: "18990",
    stock: 24,
    options: { color: "Black" },
    isActive: true,
  },
  {
    id: "31000000-0000-4000-8000-000000000002",
    productId: "30000000-0000-4000-8000-000000000001",
    name: "Cloud White",
    sku: "NVA-AIR-PRO-WHT",
    price: "18990",
    stock: 18,
    options: { color: "White" },
    isActive: true,
  },
  {
    id: "31000000-0000-4000-8000-000000000003",
    productId: "30000000-0000-4000-8000-000000000003",
    name: "Navy",
    sku: "ATL-BAG-METRO-NVY",
    price: "15990",
    stock: 12,
    options: { color: "Navy" },
    isActive: true,
  },
  {
    id: "31000000-0000-4000-8000-000000000004",
    productId: "30000000-0000-4000-8000-000000000003",
    name: "Olive",
    sku: "ATL-BAG-METRO-OLV",
    price: "15990",
    stock: 16,
    options: { color: "Olive" },
    isActive: true,
  },
  {
    id: "31000000-0000-4000-8000-000000000005",
    productId: "30000000-0000-4000-8000-000000000008",
    name: "600ml",
    sku: "ORB-BTL-600",
    price: "6490",
    stock: 22,
    options: { size: "600ml" },
    isActive: true,
  },
  {
    id: "31000000-0000-4000-8000-000000000006",
    productId: "30000000-0000-4000-8000-000000000008",
    name: "900ml",
    sku: "ORB-BTL-900",
    price: "7490",
    stock: 14,
    options: { size: "900ml" },
    isActive: true,
  },
];

// ─── Offers ───────────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: "62000000-0000-4000-8000-000000000001",
    title: "New Year Tech Refresh",
    description: "Save on featured audio and smart accessories for your daily routine.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&h=700&q=80",
    linkUrl: "/products?featured=true",
    badgeText: "Featured",
    discountPercent: "15",
    isActive: true,
    isFeatured: true,
    startsAt: new Date("2026-01-01T00:00:00Z"),
    endsAt: new Date("2027-01-31T23:59:59Z"),
    sortOrder: 1,
  },
  {
    id: "62000000-0000-4000-8000-000000000002",
    title: "Workspace Essentials",
    description: "Desk lamps, mats, and accessories for a cleaner setup.",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&h=700&q=80",
    linkUrl: "/categories/home-office",
    badgeText: "Office",
    discountPercent: "10",
    isActive: true,
    isFeatured: false,
    startsAt: new Date("2026-01-01T00:00:00Z"),
    endsAt: new Date("2027-03-31T23:59:59Z"),
    sortOrder: 2,
  },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────

const COUPONS = [
  {
    id: "61000000-0000-4000-8000-000000000001",
    code: "WELCOME10",
    type: "percent",
    value: "10",
    minOrderAmount: "5000",
    maxUses: 500,
    usedCount: 12,
    isActive: true,
    expiresAt: new Date("2027-12-31T23:59:59Z"),
  },
  {
    id: "61000000-0000-4000-8000-000000000002",
    code: "FREESHIP",
    type: "fixed",
    value: "500",
    minOrderAmount: "10000",
    maxUses: 300,
    usedCount: 28,
    isActive: true,
    expiresAt: new Date("2027-12-31T23:59:59Z"),
  },
  {
    id: "61000000-0000-4000-8000-000000000003",
    code: "EXPIRED20",
    type: "percent",
    value: "20",
    minOrderAmount: "8000",
    maxUses: 50,
    usedCount: 50,
    isActive: false,
    expiresAt: new Date("2025-12-31T23:59:59Z"),
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...\n");

  console.log("  → Categories");
  await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoNothing({ target: categories.id });

  console.log("  → Brands");
  await db
    .insert(brands)
    .values(BRANDS)
    .onConflictDoNothing({ target: brands.id });

  console.log("  → Products");
  await db
    .insert(products)
    .values(PRODUCTS)
    .onConflictDoNothing({ target: products.id });

  console.log("  → Product images");
  await db
    .insert(productImages)
    .values(PRODUCT_IMAGES)
    .onConflictDoNothing({ target: productImages.id });

  console.log("  → Product variants");
  await db
    .insert(productVariants)
    .values(PRODUCT_VARIANTS)
    .onConflictDoNothing({ target: productVariants.id });

  console.log("  → Offers");
  await db
    .insert(offers)
    .values(OFFERS)
    .onConflictDoNothing({ target: offers.id });

  console.log("  → Coupons");
  await db
    .insert(coupons)
    .values(COUPONS)
    .onConflictDoNothing({ target: coupons.id });

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
