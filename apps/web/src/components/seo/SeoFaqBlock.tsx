/**
 * Small, genuine on-page Q&A block (People-Also-Ask bait, mobile57.com
 * pattern). Pair with `buildFaqJsonLd()` from `@/lib/seo` for the matching
 * `FAQPage` JSON-LD script.
 */
export function SeoFaqBlock({
  heading = "Frequently asked questions",
  faqs,
}: {
  heading?: string;
  faqs: { question: string; answer: string }[];
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-black">{heading}</h2>
      <div className="space-y-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-zinc-200 bg-[#F9F9F9] px-5 py-1 open:bg-white"
          >
            <summary className="cursor-pointer list-none py-3 text-sm font-semibold text-black marker:hidden [&::-webkit-details-marker]:hidden">
              {faq.question}
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
