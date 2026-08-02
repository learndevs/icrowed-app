import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { formatAddress } from "@/lib/contact-page";
import { ContactSocialLinks } from "@/components/contact/ContactDetails";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "iCrowd is a Sri Lankan online store for genuine Apple iPhones, iPads and MacBooks, Anker charging gear, and DJI drones — with island-wide delivery.",
  path: "/about",
});

const BRAND_HIGHLIGHTS = [
  {
    name: "Apple",
    blurb:
      "iPhones, iPads, MacBooks, AirPods and Apple Watch — the latest models with genuine warranty.",
  },
  {
    name: "Anker",
    blurb:
      "Chargers, power banks, cables and audio gear from the world's most trusted charging brand.",
  },
  {
    name: "DJI",
    blurb:
      "Drones, gimbals and action cameras for creators, from the Mini series to professional rigs.",
  },
];

export default async function AboutPage() {
  const info = await getStorefrontContactInfoSafe();
  const address = formatAddress(info);

  return (
    <div className="min-h-[60vh] bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-black sm:text-5xl">
            About iCrowd
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed sm:text-lg">
            Genuine Apple, Anker and DJI products for Sri Lanka — delivered
            island-wide.
          </p>
        </div>
      </section>

      {/* Story + brands */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              Who we are
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-zinc-700">
              <p>
                iCrowd is a Sri Lankan online store built around one simple
                idea: getting genuine, latest-generation tech into your hands
                without the guesswork. We focus on the brands our customers ask
                for most — Apple, Anker and DJI — so every product we list is
                authentic and backed by warranty.
              </p>
              <p>
                From the newest iPhone to a reliable Anker power bank or a DJI
                drone for your next adventure, we keep our catalogue current
                and our prices competitive for the Sri Lankan market.
              </p>
              <p>
                We deliver island-wide, accept convenient payment options
                including bank deposit, and our support team is a message away
                on WhatsApp if you need help choosing the right product. Visit
                our full shop in Kandy, or pick up orders in Kottawa and Matara.
              </p>
              <p>
                <Link href="/locations" className="underline hover:opacity-70 font-medium">
                  See all locations
                </Link>
                {" · "}
                <Link href="/guides" className="underline hover:opacity-70 font-medium">
                  Buying guides
                </Link>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              What we sell
            </h2>
            {BRAND_HIGHLIGHTS.map((brand) => (
              <div
                key={brand.name}
                className="rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6"
              >
                <h3 className="text-lg font-semibold text-black">
                  {brand.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {brand.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-5 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-[#F5F5F5] p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
                Visit or reach us
              </h2>
              {address ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                  {address}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                  Serving customers across Sri Lanka.
                </p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
                Support
              </h2>
              <div className="mt-3 space-y-1.5 text-sm text-zinc-700">
                {info.phone && <p>{info.phone}</p>}
                {info.phone2 && <p>{info.phone2}</p>}
                {info.email && <p>{info.email}</p>}
                <p>
                  <Link href="/contact" className="underline hover:opacity-70">
                    Contact page
                  </Link>
                </p>
                <p>
                  <Link href="/locations/kandy" className="underline hover:opacity-70">
                    Kandy shop
                  </Link>
                  {" · "}
                  <Link href="/locations/kottawa" className="underline hover:opacity-70">
                    Kottawa
                  </Link>
                  {" · "}
                  <Link href="/locations/matara" className="underline hover:opacity-70">
                    Matara
                  </Link>
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
                Follow us
              </h2>
              <ContactSocialLinks
                info={info}
                className="mt-4 gap-4"
                iconClass="h-5 w-5"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
