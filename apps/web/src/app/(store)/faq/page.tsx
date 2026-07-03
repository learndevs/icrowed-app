import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to common questions about buying Apple iPhones, Anker accessories and DJI drones from iCrowd Sri Lanka — delivery, payments, warranty and returns.",
  path: "/faq",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Are your Apple, Anker and DJI products genuine?",
    answer:
      "Yes. Every product we sell — iPhones, iPads, MacBooks, AirPods, Anker chargers and power banks, and DJI drones and gimbals — is 100% genuine and sourced from authorised channels. Warranty details are listed on each product page.",
  },
  {
    question: "Do you deliver island-wide in Sri Lanka?",
    answer:
      "Yes, we deliver to all districts in Sri Lanka. Delivery within Colombo and suburbs is typically faster, while outstation orders usually arrive within a few working days depending on the courier.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept card payments and direct bank deposits. For bank deposits, use your order number as the payment reference — your order is confirmed once we verify the deposit, usually within 24 hours.",
  },
  {
    question: "How much does delivery cost?",
    answer:
      "Delivery charges depend on your location and the delivery option you choose at checkout. The exact charge is shown before you place the order.",
  },
  {
    question: "Do your products come with a warranty?",
    answer:
      "Most products include a warranty, which varies by brand and model. The warranty period and coverage are stated on each product page. Keep your invoice as proof of purchase for any claim.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes. After your order ships you can follow its progress on our order tracking page using your order number.",
  },
  {
    question: "What is your return policy?",
    answer:
      "If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos and your order number, and we will arrange a replacement or refund as per our terms and conditions.",
  },
  {
    question: "How do I choose the right DJI drone or Anker charger?",
    answer:
      "Message us on WhatsApp or use our contact page — our team is happy to recommend the right DJI drone, gimbal, Anker charger or power bank for your needs and budget.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-[60vh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-black sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed sm:text-lg">
            Everything you need to know about ordering, delivery, payments and
            warranty.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-5 sm:py-12 lg:px-8">
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-zinc-200 bg-[#F9F9F9] px-6 py-1 open:bg-white"
            >
              <summary className="cursor-pointer list-none py-4 text-base font-semibold text-black marker:hidden [&::-webkit-details-marker]:hidden">
                <h2 className="inline text-base font-semibold">
                  {faq.question}
                </h2>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-zinc-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-10 text-sm text-zinc-600">
          Still have a question?{" "}
          <Link href="/contact" className="font-semibold text-black underline hover:opacity-70">
            Contact us
          </Link>{" "}
          — we usually reply within a few hours.
        </p>
      </section>
    </div>
  );
}
