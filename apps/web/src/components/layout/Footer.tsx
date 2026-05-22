"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
      { label: "Phones", href: "/products?category=phones" },
      { label: "Earbuds", href: "/products?category=earbuds" },
      { label: "iPads", href: "/products?category=ipads" },
      { label: "Macbooks", href: "/products?category=macbooks" },
    ],
  },
  {
    label: "Top collection",
    links: [
      { label: "Featured", href: "/products?featured=true" },
      { label: "Top Selling", href: "/products" },
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
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/icrowed-logo.svg"
        alt="iCrowed"
        width={48}
        height={48}
        className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
      />
      <div className="flex flex-col gap-1">
        <span className="text-[1.625rem] font-bold leading-none tracking-tight text-black sm:text-[1.75rem]">
          iCrowed
        </span>
        <span className="text-[0.625rem] font-medium uppercase leading-tight tracking-[0.28em] text-black">
          WWW.ICROWED.COM
        </span>
      </div>
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

function ContactBlock({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <p className={CONTACT_LABEL_CLASS}>Address</p>
          <p className="mt-2 text-base font-medium text-black leading-relaxed">
            123 Simply Quidem
          </p>
        </div>
        <div>
          <p className={CONTACT_LABEL_CLASS}>Email</p>
          <a
            href="mailto:icrowed@gmail.com"
            className="mt-2 block text-base font-medium text-black hover:opacity-80 transition-opacity"
          >
            icrowed@gmail.com
          </a>
        </div>
        <div>
          <p className={CONTACT_LABEL_CLASS}>Phone no.</p>
          <a
            href="tel:+94123456789"
            className="mt-2 block text-base font-medium text-black hover:opacity-80 transition-opacity"
          >
            (123) 4567890
          </a>
        </div>
      </div>
    </div>
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

function SocialIcons({ className = "" }: { className?: string }) {
  const iconClass = "h-7 w-7 text-black";
  const linkClass = "flex h-9 w-9 items-center justify-center text-black transition hover:opacity-75";

  return (
    <div className={`flex items-center justify-center gap-10 ${className}`}>
      <a
        href="https://facebook.com"
        aria-label="Facebook"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      </a>
      <a
        href="https://x.com"
        aria-label="X"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href="https://youtube.com"
        aria-label="YouTube"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z" />
        </svg>
      </a>
      <a
        href="https://linkedin.com"
        aria-label="LinkedIn"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </a>
    </div>
  );
}

function FooterBottom({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-6 pt-2 text-center ${className}`}>
      <SocialIcons />
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

export default function Footer() {
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

          <ContactBlock className="mt-8" />
          <ContactForm className="mt-8" />
          <FooterBottom className="mt-8" />
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
              <ContactBlock />
            </div>
          </div>

          <div className="border-t border-zinc-500/50 pt-10">
            <h4 className={SECTION_HEADING_CLASS}>
              Get in touch
            </h4>
            <ContactForm className="max-w-md" />
          </div>

          <FooterBottom className="mt-10" />
        </div>
      </div>
    </footer>
  );
}
