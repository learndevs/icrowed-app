import type { Metadata } from "next";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { queryStorefront } from "@/lib/storefront-query";
import { PolicyContent } from "@/components/storefront/PolicyContent";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How iCrowd collects, uses and protects your personal information when you shop for Apple, Anker and DJI products in Sri Lanka.",
  path: "/privacy",
});

const FALLBACK_PRIVACY = `iCrowd respects your privacy. This policy explains how we handle your personal information.

We collect only the information needed to process your orders: your name, contact details, delivery address and order history. Payment card details are handled by our payment providers and are never stored on our servers.

We use your information to fulfil orders, arrange delivery, provide customer support and, if you opt in, send you updates about offers.

We do not sell or share your personal information with third parties, except with couriers and payment providers as required to complete your order.

You can contact us at any time to request access to, correction of, or deletion of your personal data.`;

export default async function PrivacyPage() {
  let content = "";
  try {
    const settings = await queryStorefront("privacy-page", () =>
      getOrCreateStoreSettings(),
    );
    const policies = (settings.policies ?? {}) as Partial<
      Record<"refund" | "shipping" | "privacy" | "terms", string>
    >;
    content = policies.privacy?.trim() ?? "";
  } catch {
    content = "";
  }

  return (
    <div className="min-h-[60vh] bg-white">
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-black sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed sm:text-lg">
            How we collect, use and protect your information.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-5 sm:py-12 lg:px-8">
        <PolicyContent content={content || FALLBACK_PRIVACY} />
      </section>
    </div>
  );
}
