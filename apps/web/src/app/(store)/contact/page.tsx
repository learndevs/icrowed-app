import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import {
  ContactDetails,
  ContactSocialLinks,
  whatsappLink,
} from "@/components/contact/ContactDetails";
import { STOREFRONT_REVALIDATE_SECONDS } from "@/lib/storefront-cache";

export const revalidate = STOREFRONT_REVALIDATE_SECONDS;

export async function generateMetadata(): Promise<Metadata> {
  const info = await getStorefrontContactInfoSafe();
  return {
    title: `${info.heading} | iCrowd`,
    description: info.subtitle,
  };
}

export default async function ContactPage() {
  const info = await getStorefrontContactInfoSafe();
  const waHref = whatsappLink(info.social.whatsapp);

  return (
    <div className="min-h-[60vh] bg-white">
      {/* Hero — black & white with sky blue accent */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-black">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/20 via-transparent to-sky-500/10"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-5 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            {info.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            {info.subtitle}
          </p>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-sky-300 active:scale-[0.98]"
            >
              Chat on WhatsApp
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-5 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Contact details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              Contact details
            </h2>
            <ContactDetails
              info={info}
              className="mt-8"
              labelClass="text-xs font-semibold uppercase tracking-widest text-zinc-500"
              valueClass="mt-2 text-base font-medium text-black leading-relaxed"
            />

            <div className="mt-10 space-y-4 border-t border-zinc-200 pt-8">
              {info.email && (
                <Link
                  href={`mailto:${info.email}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition hover:border-sky-400 hover:bg-sky-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Email us
                    </span>
                    <span className="text-sm font-medium text-black">{info.email}</span>
                  </span>
                </Link>
              )}

              {info.phone && (
                <Link
                  href={`tel:${info.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition hover:border-sky-400 hover:bg-sky-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Call us
                    </span>
                    <span className="text-sm font-medium text-black">{info.phone}</span>
                  </span>
                </Link>
              )}

              {(info.addressLine1 || info.city) && (
                <div className="flex items-start gap-4 rounded-xl border border-zinc-200 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-400 text-black">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Visit us
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-black">
                      {[info.addressLine1, info.addressLine2, info.city, info.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black">
              Follow us
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Connect on social media for updates, offers, and support.
            </p>
            <ContactSocialLinks
              info={info}
              className="mt-8 gap-5"
              iconClass="h-5 w-5"
              variant="contact"
            />

            {(info.phone || info.phone2) && (
              <div className="mt-10 border-t border-zinc-300 pt-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-black">
                  Phone numbers
                </p>
                <ul className="mt-4 space-y-2">
                  {info.phone && (
                    <li>
                      <a
                        href={`tel:${info.phone.replace(/\s/g, "")}`}
                        className="text-base font-medium text-black hover:text-sky-600 transition-colors"
                      >
                        {info.phone}
                      </a>
                    </li>
                  )}
                  {info.phone2 && (
                    <li>
                      <a
                        href={`tel:${info.phone2.replace(/\s/g, "")}`}
                        className="text-base font-medium text-black hover:text-sky-600 transition-colors"
                      >
                        {info.phone2}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
