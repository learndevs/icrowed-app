import Image from "next/image";
import Link from "next/link";

export type HomeOfferItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

const FALLBACK_GRADIENTS = [
  "from-slate-800 via-slate-900 to-indigo-950",
  "from-zinc-800 via-zinc-900 to-slate-950",
  "from-indigo-900 via-slate-900 to-zinc-950",
  "from-sky-900 via-slate-900 to-indigo-950",
  "from-violet-900 via-slate-900 to-zinc-950",
  "from-teal-900 via-slate-900 to-indigo-950",
] as const;

function fallbackGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}

export function HomeOfferCard({ offer }: Readonly<{ offer: HomeOfferItem }>) {
  const href = offer.linkUrl ?? "/products";
  const gradient = fallbackGradient(offer.id);

  return (
    <Link
      href={href}
      className="group relative block aspect-square w-full overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.18)]"
    >
      {offer.imageUrl ? (
        <Image
          src={offer.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 1023px) 88vw, 33vw"
          unoptimized={offer.imageUrl.startsWith("http")}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} aria-hidden />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/55 to-transparent"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-end px-6 pb-7 pt-16 text-left">
        <h3 className="text-2xl font-bold leading-tight text-white sm:text-[1.65rem]">
          {offer.title}
        </h3>
        {offer.description ? (
          <p className="mt-1.5 text-sm font-normal text-white/85 leading-snug line-clamp-2">
            {offer.description}
          </p>
        ) : null}

        <span className="mx-auto mt-5 inline-flex items-center justify-center rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition group-hover:bg-zinc-100">
          Shop Now
        </span>
      </div>
    </Link>
  );
}
