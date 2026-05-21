"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
  { label: "Terms and Conditions", href: "/terms" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src="/icrowed-logo.svg"
        alt="iCrowed"
        width={40}
        height={40}
        className="shrink-0"
      />
      <div className="flex flex-col">
        <span className="type-logo-wordmark text-zinc-900">
          iCrowed
        </span>
        <span className="type-logo-url mt-1 text-zinc-500">
          www.icrowed.com
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
      <h4 className="type-label-caps text-zinc-900 mb-4">
        {label}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm font-normal text-zinc-600 hover:text-zinc-900 transition-colors"
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
  defaultOpen = false,
}: {
  label: string;
  links: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-300/70">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left type-body-medium text-zinc-900"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-2.5 pb-4">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm font-normal text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactBlock({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-2 lg:gap-x-8">
        <div>
          <p className="type-label-caps text-zinc-900">
            Address
          </p>
          <p className="mt-1.5 type-body text-zinc-600 leading-relaxed">123 Simply quidem</p>
        </div>
        <div>
          <p className="type-label-caps text-zinc-900">
            Email
          </p>
          <a
            href="mailto:icrowed@gmail.com"
            className="mt-1.5 block type-body text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            icrowed@gmail.com
          </a>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="type-label-caps text-zinc-900">
            Phone no.
          </p>
          <a
            href="tel:+94123456789"
            className="mt-1.5 block type-body text-zinc-600 hover:text-zinc-900 transition-colors"
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
    <form
      className={`space-y-3 ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="text"
        name="name"
        placeholder="Name"
        className="w-full rounded-lg border-0 bg-white px-4 py-3 type-body text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full rounded-lg border-0 bg-white px-4 py-3 type-body text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
      <textarea
        name="message"
        placeholder="Message"
        rows={4}
        className="w-full resize-none rounded-lg border-0 bg-white px-4 py-3 type-body text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 py-3.5 type-button-caps text-white transition hover:bg-zinc-800 active:scale-[0.99]"
      >
        SUBMIT
      </button>
    </form>
  );
}

function SocialIcons({ className = "" }: { className?: string }) {
  const iconClass = "h-6 w-6 text-zinc-900";
  const linkClass =
    "flex h-8 w-8 items-center justify-center opacity-80 transition hover:opacity-100";

  return (
    <div className={`flex items-center justify-center gap-8 sm:gap-10 ${className}`}>
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
    <div
      className={`flex flex-col items-center gap-5 border-t border-zinc-300/60 pt-8 text-center ${className}`}
    >
      <SocialIcons />
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-600">
        {LEGAL_LINKS.map((link, i) => (
          <span key={link.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-zinc-400">|</span>}
            <Link href={link.href} className="hover:text-zinc-900 transition-colors">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        @2024 All rights reserved.{" "}
        <Link href="/privacy" className="underline text-zinc-700 hover:text-zinc-900">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-6 bg-[#F2F2F2]">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 sm:px-5 lg:px-8">

        {/* ── Mobile (Figma) ─────────────────────────────────────────── */}
        <div className="lg:hidden">
          <FooterLogo />

          <div className="mt-8">
            {ACCORDION_SECTIONS.map((section) => (
              <AccordionSection key={section.label} {...section} />
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
              <h4 className="type-label-caps text-zinc-900 mb-4">
                Contact
              </h4>
              <ContactBlock />
            </div>
          </div>

          <div className="border-t border-zinc-300/60 pt-10">
            <h4 className="type-label-caps text-zinc-900 mb-4">
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
