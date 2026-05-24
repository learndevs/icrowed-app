import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { parseStoreContactInfo } from "@/lib/contact-page";
import {
  ContactDetails,
  ContactSocialLinks,
} from "@/components/contact/ContactDetails";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
});

export const dynamic = "force-dynamic";

const CONTACT_SUBTITLE =
  "Get in touch with us for reliable support and information";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOrCreateStoreSettings();
  const info = parseStoreContactInfo(settings);
  return {
    title: info.heading,
    description: CONTACT_SUBTITLE,
  };
}

export default async function ContactPage() {
  const settings = await getOrCreateStoreSettings();
  const info = parseStoreContactInfo(settings);

  return (
    <div
      className="bg-white min-h-[60vh]"
      style={{ fontFamily: inter.style.fontFamily }}
    >
      {/* Hero — electric white container */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="contact-hero-card relative overflow-hidden rounded-2xl border border-zinc-200 lg:rounded-3xl">
          <div
            className="contact-hero-grid pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="contact-hero-traces pointer-events-none absolute -inset-8 opacity-70"
            aria-hidden
          />
          <div className="contact-hero-beam-x contact-hero-beam-x-1 pointer-events-none" aria-hidden />
          <div className="contact-hero-beam-x contact-hero-beam-x-2 pointer-events-none" aria-hidden />
          <div className="contact-hero-beam-x contact-hero-beam-x-3 pointer-events-none" aria-hidden />
          <div className="contact-hero-beam-y contact-hero-beam-y-1 pointer-events-none" aria-hidden />
          <div className="contact-hero-beam-y contact-hero-beam-y-2 pointer-events-none" aria-hidden />

          <div className="relative z-10 px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <h1 className="text-4xl font-bold uppercase tracking-tight text-zinc-900 sm:text-5xl">
              {info.heading}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-600 leading-relaxed">
              {CONTACT_SUBTITLE}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* Follow us */}
          <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900">
              Follow us
            </h2>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
              Connect with us on social media for updates, offers, and support.
            </p>
            <ContactSocialLinks info={info} className="mt-6" iconClass="h-5 w-5" />

            {(info.phone || info.social.whatsapp) && (
              <div className="mt-8 border-t border-zinc-300 pt-8">
                <p className="text-sm font-medium text-zinc-900">
                  Prefer WhatsApp?
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Message us directly for quick assistance.
                </p>
                {info.social.whatsapp && (
                  <a
                    href={
                      info.social.whatsapp.startsWith("http")
                        ? info.social.whatsapp
                        : `https://wa.me/${info.social.whatsapp.replace(/\D/g, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact details */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900">
              Contact details
            </h2>
            <ContactDetails info={info} className="mt-8" />
          </div>
        </div>
      </section>
    </div>
  );
}
