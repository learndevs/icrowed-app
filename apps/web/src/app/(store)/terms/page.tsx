import type { Metadata } from "next";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { queryStorefront } from "@/lib/storefront-query";
import { PolicyContent } from "@/components/storefront/PolicyContent";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms and conditions for shopping at iCrowd — genuine Apple, Anker and DJI products in Sri Lanka. Orders, payments, delivery and warranty terms.",
  path: "/terms",
});

const FALLBACK_TERMS = `Welcome to iCrowd. By placing an order on our store you agree to the following terms.

All products sold by iCrowd are genuine and sourced from authorised channels. Prices are listed in Sri Lankan Rupees (LKR) and may change without prior notice.

Orders are confirmed once payment is verified. For bank deposits, please use your order number as the payment reference; orders are processed after the deposit is verified.

Delivery is available island-wide in Sri Lanka. Delivery times may vary by location and courier availability.

Warranty coverage varies by product and is stated on each product page. Warranty claims require proof of purchase.

If you have any questions about these terms, please contact us through our contact page.`;

async function getPolicy(key: "terms" | "privacy"): Promise<string> {
  try {
    const settings = await queryStorefront("policy-page", () =>
      getOrCreateStoreSettings(),
    );
    const policies = (settings.policies ?? {}) as Partial<
      Record<"refund" | "shipping" | "privacy" | "terms", string>
    >;
    return policies[key]?.trim() ?? "";
  } catch {
    return "";
  }
}

export default async function TermsPage() {
  const content = (await getPolicy("terms")) || FALLBACK_TERMS;

  return (
    <div className="min-h-[60vh] bg-white">
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-black sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed sm:text-lg">
            Please read these terms carefully before placing an order.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-5 sm:py-12 lg:px-8">
        <PolicyContent content={content} />
      </section>
    </div>
  );
}
