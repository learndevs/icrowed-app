"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, Phone, MapPin } from "lucide-react";

const MENU_SECTIONS = [
  {
    label: "Main Menu",
    links: [
      { label: "Top collection", href: "/products?featured=true" },
      { label: "Products", href: "/products" },
    ],
  },
  {
    label: "Quick Links",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Terms and Conditions", href: "/terms" },
    ],
  },
  {
    label: "Categories",
    links: [
      { label: "Phones", href: "/products?category=phones" },
      { label: "Earbuds", href: "/products?category=earbuds" },
      { label: "iPads", href: "/products?category=ipads" },
      { label: "Macbooks", href: "/products?category=macbooks" },
      { label: "Accessories", href: "/categories" },
    ],
  },
];

function AccordionSection({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200/60">
      <button
        className="flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold text-zinc-800"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="pb-4 space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
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

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200/80 mt-4">
      {/* ── Brand banner ── */}
      <div className="relative w-full h-36 sm:h-44 overflow-hidden">
        <Image
          src="/home/hero/footer-brand.png"
          alt="iCrowed"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] tracking-tight">
            iCrowed
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        {/* ── Desktop: 4-col grid | Mobile: stack ── */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-10 pt-10 pb-8">
          {/* Contact info */}
          <div>
            <h4 className="text-sm font-black text-zinc-900 mb-4 tracking-wide uppercase">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <a href="mailto:icrowed@gmail.com" className="hover:text-zinc-800 transition-colors">
                  icrowed@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <a href="tel:+94123456789" className="hover:text-zinc-800 transition-colors">
                  (123) 4567890
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <span>123 Simply Street,<br />Colombo, Sri Lanka</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-sky-100 flex items-center justify-center transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Menu sections */}
          {MENU_SECTIONS.map((section) => (
            <div key={section.label}>
              <h4 className="text-sm font-black text-zinc-900 mb-4 tracking-wide uppercase">
                {section.label}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Mobile: accordion ── */}
        <div className="lg:hidden pt-6">
          {/* Contact — always visible on mobile */}
          <div className="mb-5">
            <h4 className="text-xs font-black text-zinc-900 mb-3 tracking-widest uppercase">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-zinc-500">
                <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <a href="mailto:icrowed@gmail.com">icrowed@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-500">
                <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <a href="tel:+94123456789">(123) 4567890</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span>123 Simply Street, Colombo</span>
              </li>
            </ul>
            {/* Social on mobile */}
            <div className="flex gap-3 mt-4">
              {[
                { href: "https://facebook.com", label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { href: "https://youtube.com", label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z" },
                { href: "https://linkedin.com", label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                    {s.label === "LinkedIn" && <circle cx="4" cy="4" r="2" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Accordion sections */}
          {MENU_SECTIONS.map((section) => (
            <AccordionSection key={section.label} {...section} />
          ))}
        </div>

        {/* ── Contact form ── */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <h4 className="text-sm font-black text-zinc-900 mb-4 tracking-wide uppercase">Send us a message</h4>
          <form
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Name"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            <input
              type="text"
              placeholder="Message"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            <button
              type="submit"
              className="sm:col-start-3 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 active:scale-[0.97] transition"
            >
              SUBMIT
            </button>
          </form>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p>@2024 All rights reserved. <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link></p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms and Conditions</Link>
            <span>|</span>
            <Link href="/about" className="hover:text-zinc-600 transition-colors">About Us</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-zinc-600 transition-colors">Contact Us</Link>
            <span>|</span>
            <Link href="/faq" className="hover:text-zinc-600 transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
