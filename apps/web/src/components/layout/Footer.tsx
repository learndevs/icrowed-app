"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { StoreContactInfo } from "@/lib/contact-page";
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

const SECTION_HEADING_CLASS =
  "text-sm font-semibold uppercase tracking-wide text-black mb-4";
const CONTACT_LABEL_CLASS =
  "text-sm font-medium uppercase tracking-wide text-black";

const ACCORDION_SECTIONS = [
  {
    label: "Main Menu",
    links: [
      { label: "Home", href: "/" },
      { label: "Categories", href: "/categories" },
      { label: "Offers", href: "/offers" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    label: "Products",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Phones", href: "/categories/phones" },
      { label: "iPhone Prices", href: "/iphone-price-sri-lanka" },
      { label: "Earbuds", href: "/categories/earbuds" },
      { label: "iPads", href: "/categories/ipads" },
      { label: "Macbooks", href: "/categories/macbooks" },
    ],
  },
  {
    label: "Locations & Guides",
    links: [
      { label: "Our Locations", href: "/locations" },
      { label: "Kandy Shop", href: "/locations/kandy" },
      { label: "Buying Guides", href: "/guides" },
      { label: "Featured", href: "/products?featured=true" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Terms And Conditions", href: "/terms" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const INPUT_CLASS =
  "w-full rounded-[10px] border-0 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400";

function FooterLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="iCrowd home"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src="/icrowd-navbar-logo.png"
        alt="iCrowd"
        width={220}
        height={64}
        unoptimized
        className="h-12 w-auto max-w-[14rem] object-contain object-left sm:h-14 sm:max-w-[17rem] lg:h-16 lg:max-w-[20rem]"
      />
    </Link>
  );
}

function MenuColumn({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className={SECTION_HEADING_CLASS}>
        {label}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-base font-normal text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccordionSection({
  label,
  links,
  isFirst = false,
}: {
  label: string;
  links: { label: string; href: string }[];
  isFirst?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-zinc-500/50 ${isFirst ? "border-t border-zinc-500/50" : ""}`}>
      <div className="px-4 sm:px-5">
        <button
          type="button"
          className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-black"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {label}
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-black transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul className="space-y-2.5 pb-4">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-base font-normal text-zinc-800 hover:text-black transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ContactBlock({
  info,
  className = "",
}: {
  info: StoreContactInfo;
  className?: string;
}) {
  return (
    <ContactDetails
      info={info}
      variant="footer"
      className={className}
      labelClass={CONTACT_LABEL_CLASS}
      valueClass="mt-2 text-base font-medium text-black leading-relaxed"
    />
  );
}

function ContactForm({ className = "" }: { className?: string }) {
  return (
    <form className={`space-y-3 ${className}`} onSubmit={(e) => e.preventDefault()}>
      <input type="text" name="name" placeholder="Name" className={INPUT_CLASS} />
      <input type="email" name="email" placeholder="Email" className={INPUT_CLASS} />
      <textarea
        name="message"
        placeholder="Message"
        rows={4}
        className={`${INPUT_CLASS} resize-none`}
      />
      <button
        type="submit"
        className="w-full rounded-[10px] bg-black py-3.5 text-base font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-800 active:scale-[0.99]"
      >
        SUBMIT
      </button>
    </form>
  );
}

function SocialIcons({
  info,
  className = "",
}: {
  info: StoreContactInfo;
  className?: string;
}) {
  return (
    <ContactSocialLinks
      info={info}
      className={`justify-center gap-10 ${className}`}
      iconClass="h-7 w-7"
      variant="plain"
    />
  );
}

function FooterBottom({
  info,
  className = "",
}: {
  info: StoreContactInfo;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-6 pt-2 text-center ${className}`}>
      <SocialIcons info={info} />
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-normal text-black">
        {LEGAL_LINKS.map((link, i) => (
          <span key={link.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-black">|</span>}
            <Link href={link.href} className="hover:opacity-70 transition-opacity">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
      <p className="text-sm text-zinc-700">
        @2024 All rights reserved.{" "}
        <Link href="/privacy" className="underline text-black hover:opacity-70">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default function Footer({ contactInfo }: { contactInfo: StoreContactInfo }) {
  return (
    <footer className="mt-6 bg-[#E6E6E6]" style={{ fontFamily: inter.style.fontFamily }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 sm:px-5 lg:px-8">

        {/* ── Mobile ─────────────────────────────────────────────────── */}
        <div className="lg:hidden">
          <FooterLogo className="mb-8" />

          {/* Full-bleed accordion dividers (edge to edge) */}
          <div className="-mx-4 sm:-mx-5">
            {ACCORDION_SECTIONS.map((section, i) => (
              <AccordionSection key={section.label} {...section} isFirst={i === 0} />
            ))}
          </div>

          <ContactBlock info={contactInfo} className="mt-8" />
          <ContactForm className="mt-8" />
          <FooterBottom info={contactInfo} className="mt-8" />
        </div>

        {/* ── Desktop / web ──────────────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-10 pb-10">
            <div className="col-span-3">
              <FooterLogo />
            </div>

            {ACCORDION_SECTIONS.map((section) => (
              <div key={section.label} className="col-span-2">
                <MenuColumn {...section} />
              </div>
            ))}

            <div className="col-span-3">
              <h4 className={SECTION_HEADING_CLASS}>
                Contact
              </h4>
              <ContactBlock info={contactInfo} />
            </div>
          </div>

          <div className="border-t border-zinc-500/50 pt-10">
            <h4 className={SECTION_HEADING_CLASS}>
              Get in touch
            </h4>
            <ContactForm className="max-w-md" />
          </div>

          <FooterBottom info={contactInfo} className="mt-10" />
        </div>
      </div>
    </footer>
  );
}
