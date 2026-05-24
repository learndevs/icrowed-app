import type { Metadata } from "next";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page";
import {
  ContactDetails,
  ContactSocialLinks,
} from "@/components/contact/ContactDetails";

// Store contact info changes rarely — revalidate hourly instead of hitting
// the DB on every request.
export const revalidate = 3600;

const CONTACT_SUBTITLE =
  "Get in touch with us for reliable support and information";

export async function generateMetadata(): Promise<Metadata> {
  const info = await getStorefrontContactInfoSafe();
  return {
    title: info.heading,
    description: CONTACT_SUBTITLE,
  };
}

export default async function ContactPage() {
  const info = await getStorefrontContactInfoSafe();

  return (
    <div className="bg-white min-h-[60vh] font-inter">
      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] px-6 py-14 sm:px-10 lg:rounded-3xl lg:px-14 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-zinc-900 sm:text-5xl">
            {info.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 leading-relaxed">
            {CONTACT_SUBTITLE}
          </p>
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
