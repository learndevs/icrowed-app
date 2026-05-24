import type { Metadata } from "next";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import {
  ContactDetails,
  ContactSocialLinks,
  whatsappLink,
} from "@/components/contact/ContactDetails";

export const revalidate = 60;

const HERO_SUBTITLE =
  "Get in touch with us for reliable support and information";

const LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-widest text-zinc-500";
const VALUE_CLASS = "mt-3 text-base font-medium text-black leading-relaxed";

export async function generateMetadata(): Promise<Metadata> {
  const info = await getStorefrontContactInfoSafe();
  return {
    title: `${info.heading} | iCrowd`,
    description: HERO_SUBTITLE,
  };
}

export default async function ContactPage() {
  const info = await getStorefrontContactInfoSafe();
  const waHref = whatsappLink(info.social.whatsapp);
  const heading = info.heading?.trim() || "Contact Us";

  return (
    <div className="min-h-[60vh] bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-black sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed sm:text-lg">
            {HERO_SUBTITLE}
          </p>
        </div>
      </section>

      {/* Follow us + Contact details */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Left — Follow us card */}
          <div className="rounded-3xl border border-zinc-200 bg-[#F5F5F5] p-8 sm:p-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              Follow us
            </h2>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
              Connect with us on social media for updates, offers, and support.
            </p>
            <ContactSocialLinks
              info={info}
              className="mt-6 gap-4"
              iconClass="h-5 w-5"
              variant="outline"
            />

            <div className="mt-10 border-t border-zinc-300 pt-8">
              <p className="text-sm font-semibold text-black">Prefer WhatsApp?</p>
              <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                Message us directly for quick assistance.
              </p>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Right — Contact details */}
          <div className="lg:pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              Contact details
            </h2>
            <ContactDetails
              info={info}
              variant="contact-page"
              labelClass={LABEL_CLASS}
              valueClass={VALUE_CLASS}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
