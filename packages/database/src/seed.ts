/**
 * Seed script — uses Supabase REST API (PostgREST) so it works even when the
 * direct PostgreSQL port is blocked. Loads env from (in order, first wins):
 *   apps/web/.env.local, repo .env.local, packages/database/.env.local
 *
 *   npm run db:seed          (from packages/database)
 *   npm run db:seed -w @icrowed/database  (from repo root)
 *   npm run db:seed          (from repo root — see root package.json)
 *
 * Includes Apple brand, Smartphones category, iPhones + AirPods + images.
 * The Next.js storefront needs DATABASE_URL in apps/web/.env.local to read products.
 */
import * as dotenv from "dotenv";
import path from "path";

// Prefer apps/web — most devs only keep Supabase keys there.
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Service role key is preferred (bypasses RLS). Fall back to anon key if the
// service role value is missing or still a placeholder (doesn't start with eyJ).
const isValidJwt = (v?: string) => typeof v === "string" && v.startsWith("eyJ");
const SUPABASE_KEY = isValidJwt(process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !isValidJwt(SUPABASE_KEY)) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or a valid Supabase API key");
  process.exit(1);
}

const KEY = SUPABASE_KEY as string;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  // ignore-duplicates — still often 409 on unique(slug) in bulk; we insert row-by-row and skip 409.
  Prefer: "resolution=ignore-duplicates,return=minimal",
};

/** Insert one row at a time so duplicates only skip that row; tolerate 409 / 23505 (already exists). */
async function upsert(table: string, rows: unknown[]): Promise<number> {
  if (rows.length === 0) return 0;
  let skipped = 0;
  for (const row of rows) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers,
      body: JSON.stringify([row]),
    });
    if (res.ok) continue;
    const text = await res.text();
    const duplicate =
      res.status === 409 ||
      text.includes("23505") ||
      text.includes("duplicate key") ||
      text.includes("already exists");
    if (duplicate) {
      skipped++;
      continue;
    }
    throw new Error(`${table}: ${res.status} ${text}`);
  }
  return skipped;
}

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Electronics",
    slug: "electronics",
    description: "Smart devices and everyday tech essentials.",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Audio",
    slug: "audio",
    description: "Headphones, earbuds, and speakers for daily listening.",
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: "10000000-0000-4000-8000-000000000001",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Home Office",
    slug: "home-office",
    description: "Desk gear for focused work and study.",
    image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: null,
    is_active: true,
    sort_order: 3,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Bags & Accessories",
    slug: "bags-accessories",
    description: "Commuter bags and useful carry goods.",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: null,
    is_active: true,
    sort_order: 4,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "Wellness",
    slug: "wellness",
    description: "Hydration and personal care products.",
    image_url: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: null,
    is_active: true,
    sort_order: 5,
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest iPhones and Android phones with genuine warranty.",
    image_url:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&h=900&q=80",
    parent_id: "10000000-0000-4000-8000-000000000001",
    is_active: true,
    sort_order: 6,
  },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

const BRANDS = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Nova",
    slug: "nova",
    logo_url: "https://dummyimage.com/240x120/111827/ffffff&text=Nova",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Orbit",
    slug: "orbit",
    logo_url: "https://dummyimage.com/240x120/0f766e/ffffff&text=Orbit",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Lume",
    slug: "lume",
    logo_url: "https://dummyimage.com/240x120/f59e0b/111827&text=Lume",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Atlas",
    slug: "atlas",
    logo_url: "https://dummyimage.com/240x120/1d4ed8/ffffff&text=Atlas",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Sachi",
    slug: "sachi",
    logo_url: "https://dummyimage.com/240x120/be123c/ffffff&text=Sachi",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    name: "Anker",
    slug: "anker",
    logo_url: "/home/anker-logo.svg",
    is_active: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    name: "Apple",
    slug: "apple",
    logo_url:
      "https://images.unsplash.com/photo-1621761191319-6df1f31816de?auto=format&fit=crop&w=400&h=200&q=80",
    is_active: true,
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    name: "Nova Airbuds Pro",
    slug: "nova-airbuds-pro",
    description: "Compact wireless earbuds with adaptive noise control, clear call microphones, and a pocketable charging case.",
    short_description: "Wireless earbuds with noise control.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000001",
    sku: "NVA-AIR-PRO",
    price: 18990,
    compare_price: 22990,
    cost: 11200,
    stock: 42,
    low_stock_threshold: 8,
    is_featured: true,
    is_active: true,
    specifications: { connectivity: "Bluetooth 5.3", battery: "28 hours with case", warranty: "1 year" },
    tags: ["audio", "wireless", "featured"],
    weight: 0.18,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    name: "Orbit Mini Bluetooth Speaker",
    slug: "orbit-mini-bluetooth-speaker",
    description: "A splash-resistant portable speaker with balanced sound for rooms, trips, and casual gatherings.",
    short_description: "Portable speaker with rich sound.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000002",
    sku: "ORB-SPK-MINI",
    price: 12990,
    compare_price: 14990,
    cost: 7200,
    stock: 5,
    low_stock_threshold: 6,
    is_featured: true,
    is_active: true,
    specifications: { battery: "16 hours", rating: "IPX5", input: "USB-C" },
    tags: ["audio", "speaker", "low-stock"],
    weight: 0.62,
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    name: "Atlas Metro Backpack",
    slug: "atlas-metro-backpack",
    description: "A structured daily backpack with a padded laptop sleeve, quick-access pocket, and water-resistant fabric.",
    short_description: "Laptop backpack for daily commutes.",
    category_id: "10000000-0000-4000-8000-000000000004",
    brand_id: "20000000-0000-4000-8000-000000000004",
    sku: "ATL-BAG-METRO",
    price: 15990,
    compare_price: 18990,
    cost: 9300,
    stock: 28,
    low_stock_threshold: 5,
    is_featured: true,
    is_active: true,
    specifications: { capacity: "22L", laptop: "15 inch", material: "Recycled polyester" },
    tags: ["bag", "commute", "laptop"],
    weight: 0.85,
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    name: "Lume Flex Desk Lamp",
    slug: "lume-flex-desk-lamp",
    description: "Adjustable LED desk lamp with three warmth settings, dimming, and a stable metal base.",
    short_description: "Adjustable LED desk lamp.",
    category_id: "10000000-0000-4000-8000-000000000003",
    brand_id: "20000000-0000-4000-8000-000000000003",
    sku: "LME-LMP-FLEX",
    price: 8990,
    compare_price: 10990,
    cost: 4800,
    stock: 19,
    low_stock_threshold: 4,
    is_featured: false,
    is_active: true,
    specifications: { brightness: "800 lumens", modes: "Warm, neutral, cool", power: "USB-C" },
    tags: ["desk", "lighting"],
    weight: 1.10,
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    name: "Sachi Gooseneck Kettle",
    slug: "sachi-gooseneck-kettle",
    description: "Precision-pour stainless steel kettle for tea and pour-over coffee at home.",
    short_description: "Stainless steel gooseneck kettle.",
    category_id: "10000000-0000-4000-8000-000000000003",
    brand_id: "20000000-0000-4000-8000-000000000005",
    sku: "SCH-KTL-GOOSE",
    price: 11990,
    compare_price: 13990,
    cost: 6400,
    stock: 14,
    low_stock_threshold: 4,
    is_featured: false,
    is_active: true,
    specifications: { capacity: "1L", material: "Stainless steel", handle: "Heat resistant" },
    tags: ["kitchen", "coffee"],
    weight: 0.95,
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    name: "Nova Fit Watch S2",
    slug: "nova-fit-watch-s2",
    description: "Lightweight fitness watch with heart-rate tracking, sleep insights, and a bright always-on display.",
    short_description: "Fitness watch with health tracking.",
    category_id: "10000000-0000-4000-8000-000000000001",
    brand_id: "20000000-0000-4000-8000-000000000001",
    sku: "NVA-WCH-S2",
    price: 24990,
    compare_price: 29990,
    cost: 15200,
    stock: 0,
    low_stock_threshold: 5,
    is_featured: false,
    is_active: true,
    specifications: { display: "1.43 inch AMOLED", battery: "7 days", sensors: "Heart rate, SpO2" },
    tags: ["fitness", "watch", "out-of-stock"],
    weight: 0.08,
  },
  {
    id: "30000000-0000-4000-8000-000000000007",
    name: "Lume Workspace Desk Mat",
    slug: "lume-workspace-desk-mat",
    description: "A smooth desk mat with stitched edges, soft texture, and enough room for keyboard and mouse.",
    short_description: "Large stitched desk mat.",
    category_id: "10000000-0000-4000-8000-000000000003",
    brand_id: "20000000-0000-4000-8000-000000000003",
    sku: "LME-MAT-WORK",
    price: 4990,
    compare_price: null,
    cost: 2100,
    stock: 64,
    low_stock_threshold: 10,
    is_featured: false,
    is_active: true,
    specifications: { size: "90 x 40 cm", surface: "Micro-weave cloth", backing: "Non-slip rubber" },
    tags: ["desk", "workspace"],
    weight: 0.45,
  },
  {
    id: "30000000-0000-4000-8000-000000000008",
    name: "Orbit Insulated Bottle",
    slug: "orbit-insulated-bottle",
    description: "Double-wall stainless steel bottle that keeps drinks cold through long commutes and warm afternoons.",
    short_description: "Insulated stainless steel bottle.",
    category_id: "10000000-0000-4000-8000-000000000005",
    brand_id: "20000000-0000-4000-8000-000000000002",
    sku: "ORB-BTL-BASE",
    price: 6490,
    compare_price: 7490,
    cost: 3200,
    stock: 36,
    low_stock_threshold: 8,
    is_featured: true,
    is_active: true,
    specifications: { material: "18/8 stainless steel", insulation: "Double wall", lid: "Leak resistant" },
    tags: ["wellness", "hydration"],
    weight: 0.34,
  },
  {
    id: "30000000-0000-4000-8000-000000000009",
    name: "Anker PowerLine III USB-C Cable (6 ft)",
    slug: "anker-powerline-iii-usbc-6ft",
    description: "Durable USB-C charging cable with reinforced connectors for phones, tablets, and laptops.",
    short_description: "Fast charging USB-C cable.",
    category_id: "10000000-0000-4000-8000-000000000001",
    brand_id: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-CBL-USBC6",
    price: 2290,
    compare_price: 3490,
    cost: 950,
    stock: 120,
    low_stock_threshold: 15,
    is_featured: false,
    is_active: true,
    specifications: { length: "6 ft", rating: "USB 2.0 data", jacket: "Double-braided nylon" },
    tags: ["anker", "cable", "usb-c"],
    weight: 0.06,
  },
  {
    id: "30000000-0000-4000-8000-000000000010",
    name: "Anker PowerCore 10000 Portable Charger",
    slug: "anker-powercore-10000",
    description: "Compact high-density power bank with USB-C and USB-A outputs for all-day backup power.",
    short_description: "10,000 mAh compact power bank.",
    category_id: "10000000-0000-4000-8000-000000000001",
    brand_id: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-PB-10K",
    price: 8490,
    compare_price: 9990,
    cost: 4200,
    stock: 38,
    low_stock_threshold: 8,
    is_featured: true,
    is_active: true,
    specifications: { capacity: "10000 mAh", ports: "USB-C + USB-A", input: "USB-C" },
    tags: ["anker", "power-bank", "charging"],
    weight: 0.22,
  },
  {
    id: "30000000-0000-4000-8000-000000000011",
    name: "Anker Soundcore P20i True Wireless Earbuds",
    slug: "anker-soundcore-p20i",
    description: "True wireless earbuds with punchy bass, clear calls, and long battery life in a pocketable case.",
    short_description: "True wireless earbuds with deep bass.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-SCP-P20I",
    price: 13990,
    compare_price: 16990,
    cost: 7800,
    stock: 55,
    low_stock_threshold: 10,
    is_featured: true,
    is_active: true,
    specifications: { connectivity: "Bluetooth 5.3", battery: "30 hours with case", drivers: "10 mm" },
    tags: ["anker", "audio", "earbuds"],
    weight: 0.05,
  },
  {
    id: "30000000-0000-4000-8000-000000000012",
    name: "Apple iPhone 16 Pro 256GB",
    slug: "apple-iphone-16-pro-256gb",
    description:
      "Titanium design, A18 Pro chip, pro camera system with 5x telephoto, and all-day battery. Genuine Apple warranty in Sri Lanka.",
    short_description: "Flagship titanium iPhone with pro cameras.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP16P-256",
    price: 524990,
    compare_price: 549990,
    cost: 410000,
    stock: 14,
    low_stock_threshold: 4,
    is_featured: true,
    is_active: true,
    specifications: {
      display: "6.3 inch Super Retina XDR",
      chip: "A18 Pro",
      storage: "256GB",
      connectivity: "5G",
    },
    tags: ["apple", "iphone", "smartphone", "5g"],
    weight: 0.2,
  },
  {
    id: "30000000-0000-4000-8000-000000000013",
    name: "Apple iPhone 16 128GB",
    slug: "apple-iphone-16-128gb",
    description:
      "A18 chip, Action button, 48MP Fusion camera, and USB-C. Bright Super Retina XDR display in a durable aluminum frame.",
    short_description: "Latest iPhone with A18 and 48MP camera.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP16-128",
    price: 389990,
    compare_price: 409990,
    cost: 305000,
    stock: 22,
    low_stock_threshold: 5,
    is_featured: true,
    is_active: true,
    specifications: { display: "6.1 inch", chip: "A18", storage: "128GB", connectivity: "5G" },
    tags: ["apple", "iphone", "smartphone"],
    weight: 0.17,
  },
  {
    id: "30000000-0000-4000-8000-000000000014",
    name: "Apple iPhone 15 Pro Max 256GB",
    slug: "apple-iphone-15-pro-max-256gb",
    description:
      "Largest Pro display, A17 Pro, titanium build, and longest battery life in an iPhone 15 generation device.",
    short_description: "6.7 inch Pro Max with A17 Pro.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP15PM-256",
    price: 479990,
    compare_price: null,
    cost: 375000,
    stock: 9,
    low_stock_threshold: 4,
    is_featured: false,
    is_active: true,
    specifications: { display: "6.7 inch", chip: "A17 Pro", storage: "256GB", connectivity: "5G" },
    tags: ["apple", "iphone", "pro-max"],
    weight: 0.22,
  },
  {
    id: "30000000-0000-4000-8000-000000000015",
    name: "Apple iPhone 15 128GB",
    slug: "apple-iphone-15-128gb",
    description:
      "Dynamic Island, 48MP main camera, USB-C, and all-day battery — the balanced iPhone 15 experience.",
    short_description: "Dynamic Island and 48MP camera.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP15-128",
    price: 299990,
    compare_price: 324990,
    cost: 235000,
    stock: 31,
    low_stock_threshold: 6,
    is_featured: false,
    is_active: true,
    specifications: { display: "6.1 inch", chip: "A16 Bionic", storage: "128GB", connectivity: "5G" },
    tags: ["apple", "iphone", "smartphone"],
    weight: 0.17,
  },
  {
    id: "30000000-0000-4000-8000-000000000016",
    name: "Apple iPhone 14 128GB",
    slug: "apple-iphone-14-128gb",
    description:
      "A15 Bionic, advanced dual-camera system, and Crash Detection. A proven iPhone with great value.",
    short_description: "Reliable iPhone 14 with A15.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP14-128",
    price: 229990,
    compare_price: 259990,
    cost: 178000,
    stock: 18,
    low_stock_threshold: 5,
    is_featured: false,
    is_active: true,
    specifications: { display: "6.1 inch", chip: "A15 Bionic", storage: "128GB", connectivity: "5G" },
    tags: ["apple", "iphone", "value"],
    weight: 0.17,
  },
  {
    id: "30000000-0000-4000-8000-000000000017",
    name: "Apple AirPods Pro (2nd generation)",
    slug: "apple-airpods-pro-2nd-gen",
    description:
      "Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and MagSafe charging case (USB-C).",
    short_description: "Pro earbuds with ANC and Spatial Audio.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-APP2-USBc",
    price: 89990,
    compare_price: 99990,
    cost: 62000,
    stock: 40,
    low_stock_threshold: 8,
    is_featured: false,
    is_active: true,
    specifications: { chip: "H2", case: "MagSafe USB-C", resistance: "IP54" },
    tags: ["apple", "airpods", "audio"],
    weight: 0.06,
  },
  {
    id: "30000000-0000-4000-8000-000000000018",
    name: "Apple iPhone 16 Pro Max 256GB",
    slug: "apple-iphone-16-pro-max-256gb",
    description:
      "Largest 6.9 inch Super Retina XDR display, A18 Pro, longest battery life in the iPhone 16 lineup, and pro camera system with 5x telephoto.",
    short_description: "Ultimate iPhone 16 Pro Max with A18 Pro.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-16PM-256",
    price: 584990,
    compare_price: null,
    cost: 455000,
    stock: 11,
    low_stock_threshold: 4,
    is_featured: true,
    is_active: true,
    specifications: { display: "6.9 inch", chip: "A18 Pro", storage: "256GB", connectivity: "5G" },
    tags: ["apple", "iphone", "pro-max"],
    weight: 0.23,
  },
  {
    id: "30000000-0000-4000-8000-000000000019",
    name: "Apple iPhone 16 Plus 128GB",
    slug: "apple-iphone-16-plus-128gb",
    description:
      "Big 6.7 inch display, A18 chip, Camera Control, and all-day battery — iPhone 16 experience in a larger size.",
    short_description: "Large-screen iPhone 16 Plus.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-16PL-128",
    price: 429990,
    compare_price: 449990,
    cost: 335000,
    stock: 16,
    low_stock_threshold: 5,
    is_featured: false,
    is_active: true,
    specifications: { display: "6.7 inch", chip: "A18", storage: "128GB", connectivity: "5G" },
    tags: ["apple", "iphone", "plus"],
    weight: 0.2,
  },
  {
    id: "30000000-0000-4000-8000-000000000020",
    name: "Apple iPhone 13 128GB",
    slug: "apple-iphone-13-128gb",
    description:
      "A15 Bionic, bright OLED display, great battery life, and dual 12MP cameras — a dependable iPhone at a sharper price.",
    short_description: "Popular iPhone 13 with A15.",
    category_id: "10000000-0000-4000-8000-000000000010",
    brand_id: "20000000-0000-4000-8000-000000000007",
    sku: "APL-IP13-128",
    price: 199990,
    compare_price: 219990,
    cost: 155000,
    stock: 28,
    low_stock_threshold: 6,
    is_featured: false,
    is_active: true,
    specifications: { display: "6.1 inch OLED", chip: "A15 Bionic", storage: "128GB", connectivity: "5G" },
    tags: ["apple", "iphone", "value"],
    weight: 0.17,
  },
  {
    id: "30000000-0000-4000-8000-000000000021",
    name: "Anker Soundcore Liberty 4 NC",
    slug: "anker-soundcore-liberty-4-nc",
    description:
      "Adaptive ANC, Hi-Res wireless sound, multipoint Bluetooth, and up to 50 hours playtime with the charging case.",
    short_description: "Adaptive ANC earbuds with long battery.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-SC-L4NC",
    price: 18990,
    compare_price: 22990,
    cost: 10200,
    stock: 42,
    low_stock_threshold: 10,
    is_featured: true,
    is_active: true,
    specifications: { drivers: "11 mm", bluetooth: "5.3", anc: "Adaptive hybrid" },
    tags: ["anker", "earbuds", "anc"],
    weight: 0.055,
  },
  {
    id: "30000000-0000-4000-8000-000000000022",
    name: "Anker Soundcore Space A40",
    slug: "anker-soundcore-space-a40",
    description:
      "Double-layer diaphragm drivers, adaptive ANC up to 98% noise reduction, and 50 hours total playtime for daily commutes.",
    short_description: "Adaptive ANC with 50h playtime.",
    category_id: "10000000-0000-4000-8000-000000000002",
    brand_id: "20000000-0000-4000-8000-000000000006",
    sku: "ANK-SC-A40",
    price: 16990,
    compare_price: 19990,
    cost: 9200,
    stock: 36,
    low_stock_threshold: 8,
    is_featured: false,
    is_active: true,
    specifications: { bluetooth: "5.2", playtime: "50 hours with case", water: "IPX4" },
    tags: ["anker", "earbuds", "commute"],
    weight: 0.05,
  },
];

// ─── Product Images ───────────────────────────────────────────────────────────

const PRODUCT_IMAGES = [
  {
    id: "32000000-0000-4000-8000-000000000001",
    product_id: "30000000-0000-4000-8000-000000000001",
    url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Nova Airbuds Pro case and earbuds",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000002",
    product_id: "30000000-0000-4000-8000-000000000002",
    url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Orbit Mini Bluetooth Speaker",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000003",
    product_id: "30000000-0000-4000-8000-000000000003",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Atlas Metro Backpack",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000004",
    product_id: "30000000-0000-4000-8000-000000000004",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Lume Flex Desk Lamp",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000005",
    product_id: "30000000-0000-4000-8000-000000000005",
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Sachi Gooseneck Kettle",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000006",
    product_id: "30000000-0000-4000-8000-000000000006",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Nova Fit Watch S2",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000007",
    product_id: "30000000-0000-4000-8000-000000000007",
    url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Lume Workspace Desk Mat",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000008",
    product_id: "30000000-0000-4000-8000-000000000008",
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Orbit Insulated Bottle",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000009",
    product_id: "30000000-0000-4000-8000-000000000009",
    url: "https://images.unsplash.com/photo-1583863788434-e58a363be820?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker USB-C cable",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000010",
    product_id: "30000000-0000-4000-8000-000000000010",
    url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker portable charger",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000011",
    product_id: "30000000-0000-4000-8000-000000000011",
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Soundcore wireless earbuds",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000012",
    product_id: "30000000-0000-4000-8000-000000000012",
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000013",
    product_id: "30000000-0000-4000-8000-000000000013",
    url: "https://images.unsplash.com/photo-1696442016688-c6542c9320a5?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000014",
    product_id: "30000000-0000-4000-8000-000000000014",
    url: "https://images.unsplash.com/photo-1678685881267-93167bacb76a?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 15 Pro Max",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000015",
    product_id: "30000000-0000-4000-8000-000000000015",
    url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 15",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000016",
    product_id: "30000000-0000-4000-8000-000000000016",
    url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 14",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000017",
    product_id: "30000000-0000-4000-8000-000000000017",
    url: "https://images.unsplash.com/photo-1606841837239-9879333b4ff9?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple AirPods Pro",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000018",
    product_id: "30000000-0000-4000-8000-000000000011",
    url: "https://images.unsplash.com/photo-1572569511254-d8f925fa2fbc?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Soundcore P20i alternate angle",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000019",
    product_id: "30000000-0000-4000-8000-000000000011",
    url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Soundcore P20i in case",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000020",
    product_id: "30000000-0000-4000-8000-000000000012",
    url: "https://images.unsplash.com/photo-1592899677857-9e886785db27?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro side view",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000021",
    product_id: "30000000-0000-4000-8000-000000000012",
    url: "https://images.unsplash.com/photo-1511707171634-6ff78de97788?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro cameras",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000022",
    product_id: "30000000-0000-4000-8000-000000000013",
    url: "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 back",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000023",
    product_id: "30000000-0000-4000-8000-000000000013",
    url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 in hand",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000024",
    product_id: "30000000-0000-4000-8000-000000000018",
    url: "https://images.unsplash.com/photo-1726676200037-24b74d7a10d9?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro Max",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000025",
    product_id: "30000000-0000-4000-8000-000000000018",
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro Max titanium",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000026",
    product_id: "30000000-0000-4000-8000-000000000018",
    url: "https://images.unsplash.com/photo-1678685881267-93167bacb76a?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Pro Max display",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000027",
    product_id: "30000000-0000-4000-8000-000000000019",
    url: "https://images.unsplash.com/photo-1696442016688-c6542c9320a5?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Plus",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000028",
    product_id: "30000000-0000-4000-8000-000000000019",
    url: "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Plus colors",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000029",
    product_id: "30000000-0000-4000-8000-000000000019",
    url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 16 Plus lifestyle",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000030",
    product_id: "30000000-0000-4000-8000-000000000020",
    url: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 13",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000031",
    product_id: "30000000-0000-4000-8000-000000000020",
    url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 13 back glass",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000032",
    product_id: "30000000-0000-4000-8000-000000000020",
    url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&h=1200&q=80",
    alt_text: "Apple iPhone 13 display on",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000033",
    product_id: "30000000-0000-4000-8000-000000000021",
    url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Soundcore Liberty 4 NC",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000034",
    product_id: "30000000-0000-4000-8000-000000000021",
    url: "https://images.unsplash.com/photo-1572569511254-d8f925fa2fbc?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Liberty 4 NC case",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000035",
    product_id: "30000000-0000-4000-8000-000000000021",
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Liberty 4 NC earbuds detail",
    is_primary: false,
    sort_order: 3,
  },
  {
    id: "32000000-0000-4000-8000-000000000036",
    product_id: "30000000-0000-4000-8000-000000000022",
    url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Soundcore Space A40",
    is_primary: true,
    sort_order: 1,
  },
  {
    id: "32000000-0000-4000-8000-000000000037",
    product_id: "30000000-0000-4000-8000-000000000022",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Space A40 charging case",
    is_primary: false,
    sort_order: 2,
  },
  {
    id: "32000000-0000-4000-8000-000000000038",
    product_id: "30000000-0000-4000-8000-000000000022",
    url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&h=900&q=80",
    alt_text: "Anker Space A40 lifestyle",
    is_primary: false,
    sort_order: 3,
  },
];

// ─── Product Variants ─────────────────────────────────────────────────────────

const PRODUCT_VARIANTS = [
  { id: "31000000-0000-4000-8000-000000000001", product_id: "30000000-0000-4000-8000-000000000001", name: "Matte Black", sku: "NVA-AIR-PRO-BLK", price: 18990, stock: 24, options: { color: "Black", colorHex: "#1c1c1e" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000002", product_id: "30000000-0000-4000-8000-000000000001", name: "Cloud White", sku: "NVA-AIR-PRO-WHT", price: 18990, stock: 18, options: { color: "White", colorHex: "#f5f5f7" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000003", product_id: "30000000-0000-4000-8000-000000000003", name: "Navy", sku: "ATL-BAG-METRO-NVY", price: 15990, stock: 12, options: { color: "Navy", colorHex: "#1e3a5f" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000004", product_id: "30000000-0000-4000-8000-000000000003", name: "Olive", sku: "ATL-BAG-METRO-OLV", price: 15990, stock: 16, options: { color: "Olive", colorHex: "#556b2f" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000005", product_id: "30000000-0000-4000-8000-000000000008", name: "600ml", sku: "ORB-BTL-600", price: 6490, stock: 22, options: { volume: "600ml" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000006", product_id: "30000000-0000-4000-8000-000000000008", name: "900ml", sku: "ORB-BTL-900", price: 7490, stock: 14, options: { volume: "900ml" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000007", product_id: "30000000-0000-4000-8000-000000000021", name: "Black", sku: "ANK-L4NC-BLK", price: null, stock: 22, options: { color: "Black", colorHex: "#1a1a1a" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000008", product_id: "30000000-0000-4000-8000-000000000021", name: "White", sku: "ANK-L4NC-WHT", price: null, stock: 20, options: { color: "White", colorHex: "#ececec" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000009", product_id: "30000000-0000-4000-8000-000000000022", name: "Black", sku: "ANK-A40-BLK", price: null, stock: 18, options: { color: "Black", colorHex: "#1a1a1a" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000010", product_id: "30000000-0000-4000-8000-000000000022", name: "Blue", sku: "ANK-A40-BLU", price: null, stock: 18, options: { color: "Blue", colorHex: "#2563eb" }, is_active: true },

  // Apple iPhones — color + explicit hex so storefront swatches match finishes
  { id: "31000000-0000-4000-8000-000000000011", product_id: "30000000-0000-4000-8000-000000000012", name: "Natural Titanium", sku: "APL-IP16P-256-NT", price: null, stock: 4, options: { color: "Natural Titanium", colorHex: "#b8b0a4" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000012", product_id: "30000000-0000-4000-8000-000000000012", name: "Blue Titanium", sku: "APL-IP16P-256-BT", price: null, stock: 4, options: { color: "Blue Titanium", colorHex: "#55606a" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000013", product_id: "30000000-0000-4000-8000-000000000012", name: "White Titanium", sku: "APL-IP16P-256-WT", price: null, stock: 3, options: { color: "White Titanium", colorHex: "#e8e6e1" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000014", product_id: "30000000-0000-4000-8000-000000000012", name: "Black Titanium", sku: "APL-IP16P-256-BKT", price: null, stock: 3, options: { color: "Black Titanium", colorHex: "#3e3e41" }, is_active: true },

  { id: "31000000-0000-4000-8000-000000000015", product_id: "30000000-0000-4000-8000-000000000013", name: "Black", sku: "APL-IP16-128-BLK", price: null, stock: 5, options: { color: "Black", colorHex: "#1c1c1e" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000016", product_id: "30000000-0000-4000-8000-000000000013", name: "White", sku: "APL-IP16-128-WHT", price: null, stock: 5, options: { color: "White", colorHex: "#f5f5f7" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000017", product_id: "30000000-0000-4000-8000-000000000013", name: "Pink", sku: "APL-IP16-128-PNK", price: null, stock: 4, options: { color: "Pink", colorHex: "#e8a4b8" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000018", product_id: "30000000-0000-4000-8000-000000000013", name: "Teal", sku: "APL-IP16-128-TL", price: null, stock: 4, options: { color: "Teal", colorHex: "#3d6b5e" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000019", product_id: "30000000-0000-4000-8000-000000000013", name: "Ultramarine", sku: "APL-IP16-128-UM", price: null, stock: 4, options: { color: "Ultramarine", colorHex: "#2e3a8c" }, is_active: true },

  { id: "31000000-0000-4000-8000-000000000020", product_id: "30000000-0000-4000-8000-000000000018", name: "Natural Titanium", sku: "APL-16PM-256-NT", price: null, stock: 3, options: { color: "Natural Titanium", colorHex: "#b8b0a4" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000021", product_id: "30000000-0000-4000-8000-000000000018", name: "Blue Titanium", sku: "APL-16PM-256-BT", price: null, stock: 3, options: { color: "Blue Titanium", colorHex: "#55606a" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000022", product_id: "30000000-0000-4000-8000-000000000018", name: "White Titanium", sku: "APL-16PM-256-WT", price: null, stock: 3, options: { color: "White Titanium", colorHex: "#e8e6e1" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000023", product_id: "30000000-0000-4000-8000-000000000018", name: "Black Titanium", sku: "APL-16PM-256-BKT", price: null, stock: 2, options: { color: "Black Titanium", colorHex: "#3e3e41" }, is_active: true },

  { id: "31000000-0000-4000-8000-000000000024", product_id: "30000000-0000-4000-8000-000000000019", name: "Black", sku: "APL-16PL-128-BLK", price: null, stock: 4, options: { color: "Black", colorHex: "#1c1c1e" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000025", product_id: "30000000-0000-4000-8000-000000000019", name: "White", sku: "APL-16PL-128-WHT", price: null, stock: 4, options: { color: "White", colorHex: "#f5f5f7" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000026", product_id: "30000000-0000-4000-8000-000000000019", name: "Pink", sku: "APL-16PL-128-PNK", price: null, stock: 3, options: { color: "Pink", colorHex: "#e8a4b8" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000027", product_id: "30000000-0000-4000-8000-000000000019", name: "Teal", sku: "APL-16PL-128-TL", price: null, stock: 3, options: { color: "Teal", colorHex: "#3d6b5e" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000028", product_id: "30000000-0000-4000-8000-000000000019", name: "Ultramarine", sku: "APL-16PL-128-UM", price: null, stock: 2, options: { color: "Ultramarine", colorHex: "#2e3a8c" }, is_active: true },

  { id: "31000000-0000-4000-8000-000000000029", product_id: "30000000-0000-4000-8000-000000000020", name: "Midnight", sku: "APL-IP13-128-MID", price: null, stock: 6, options: { color: "Midnight", colorHex: "#1e1e24" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000030", product_id: "30000000-0000-4000-8000-000000000020", name: "Starlight", sku: "APL-IP13-128-ST", price: null, stock: 6, options: { color: "Starlight", colorHex: "#faf7f2" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000031", product_id: "30000000-0000-4000-8000-000000000020", name: "Blue", sku: "APL-IP13-128-BLU", price: null, stock: 6, options: { color: "Blue", colorHex: "#4b6baf" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000032", product_id: "30000000-0000-4000-8000-000000000020", name: "Pink", sku: "APL-IP13-128-PNK", price: null, stock: 5, options: { color: "Pink", colorHex: "#e8a4b8" }, is_active: true },
  { id: "31000000-0000-4000-8000-000000000033", product_id: "30000000-0000-4000-8000-000000000020", name: "PRODUCT(RED)", sku: "APL-IP13-128-RED", price: null, stock: 5, options: { color: "PRODUCT(RED)", colorHex: "#bf0013" }, is_active: true },
];

// ─── Offers ───────────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: "62000000-0000-4000-8000-000000000001",
    title: "New Year Tech Refresh",
    description: "Save on featured audio and smart accessories for your daily routine.",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&h=700&q=80",
    link_url: "/products?featured=true",
    badge_text: "Featured",
    discount_percent: 15,
    is_active: true,
    is_featured: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2027-01-31T23:59:59Z",
    sort_order: 1,
  },
  {
    id: "62000000-0000-4000-8000-000000000002",
    title: "Workspace Essentials",
    description: "Desk lamps, mats, and accessories for a cleaner setup.",
    image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&h=700&q=80",
    link_url: "/categories/home-office",
    badge_text: "Office",
    discount_percent: 10,
    is_active: true,
    is_featured: false,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2027-03-31T23:59:59Z",
    sort_order: 2,
  },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────

const COUPONS = [
  { id: "61000000-0000-4000-8000-000000000001", code: "WELCOME10", type: "percent", value: 10, min_order_amount: 5000, max_uses: 500, used_count: 12, is_active: true, expires_at: "2027-12-31T23:59:59Z" },
  { id: "61000000-0000-4000-8000-000000000002", code: "FREESHIP",  type: "fixed",   value: 500, min_order_amount: 10000, max_uses: 300, used_count: 28, is_active: true, expires_at: "2027-12-31T23:59:59Z" },
  { id: "61000000-0000-4000-8000-000000000003", code: "EXPIRED20", type: "percent", value: 20, min_order_amount: 8000, max_uses: 50, used_count: 50, is_active: false, expires_at: "2025-12-31T23:59:59Z" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database via Supabase REST API...\n");

  const steps: [string, unknown[]][] = [
    ["categories",       CATEGORIES],
    ["brands",           BRANDS],
    ["products",         PRODUCTS],
    ["product_images",   PRODUCT_IMAGES],
    ["product_variants", PRODUCT_VARIANTS],
    ["offers",           OFFERS],
    ["coupons",          COUPONS],
  ];

  for (const [table, rows] of steps) {
    process.stdout.write(`  → ${table} … `);
    const skipped = await upsert(table, rows);
    if (skipped > 0) {
      console.log(`✓ (${rows.length} rows, ${skipped} already present — skipped)`);
    } else {
      console.log(`✓ (${rows.length})`);
    }
  }

  console.log("\n✅ Seed complete.");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
