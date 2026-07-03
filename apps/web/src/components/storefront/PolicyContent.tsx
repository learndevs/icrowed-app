/**
 * Renders a store policy authored in the admin Policies tab.
 * Content is admin-only input (plain text or HTML), same trust model as the
 * email templates — no untrusted user input ever reaches this field.
 */
export function PolicyContent({ content }: { content: string }) {
  const trimmed = content.trim();
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);

  if (looksLikeHtml) {
    return (
      <div
        className="prose-policy text-base leading-relaxed text-zinc-700 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-black [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-black [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <div className="space-y-4 text-base leading-relaxed text-zinc-700">
      {trimmed
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
    </div>
  );
}
