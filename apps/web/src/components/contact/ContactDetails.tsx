import type { StoreContactInfo } from "@/lib/contact-page";

function whatsappHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : trimmed;
}

function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}

export function ContactDetails({
  info,
  className = "",
  labelClass = "text-xs font-semibold uppercase tracking-widest text-zinc-500",
  valueClass = "mt-2 text-base font-medium text-zinc-900 leading-relaxed",
  variant = "default",
}: {
  info: StoreContactInfo;
  className?: string;
  labelClass?: string;
  valueClass?: string;
  variant?: "default" | "footer";
}) {
  const addressParts = [
    info.addressLine1,
    info.addressLine2,
    [info.city, info.country].filter(Boolean).join(", "),
  ].filter(Boolean);

  const gridClass =
    variant === "footer"
      ? "grid grid-cols-2 gap-x-6 gap-y-6"
      : "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8";

  const phoneLabel = variant === "footer" ? "Phone no." : "Phone";

  if (variant === "footer") {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        <div className="grid grid-cols-2 gap-x-6">
          {addressParts.length > 0 && (
            <div>
              <p className={labelClass}>Address</p>
              <p className={valueClass}>
                {addressParts.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressParts.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          )}

          {info.email ? (
            <div>
              <p className={labelClass}>Email</p>
              <a
                href={`mailto:${info.email}`}
                className={`${valueClass} block hover:opacity-80 transition-opacity`}
              >
                {info.email}
              </a>
            </div>
          ) : (
            <div aria-hidden="true" />
          )}
        </div>

        {(info.phone || info.phone2) && (
          <div className="grid grid-cols-2 gap-x-6">
            {info.phone ? (
              <div>
                <p className={labelClass}>{phoneLabel}</p>
                <a
                  href={telHref(info.phone)}
                  className={`${valueClass} block hover:opacity-80 transition-opacity`}
                >
                  {info.phone}
                </a>
              </div>
            ) : (
              <div aria-hidden="true" />
            )}

            {info.phone2 ? (
              <div>
                <p className={labelClass}>Phone 2</p>
                <a
                  href={telHref(info.phone2)}
                  className={`${valueClass} block hover:opacity-80 transition-opacity`}
                >
                  {info.phone2}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${gridClass} ${className}`}>
      {addressParts.length > 0 && (
        <div>
          <p className={labelClass}>Address</p>
          <p className={valueClass}>
            {addressParts.map((line, i) => (
              <span key={i}>
                {line}
                {i < addressParts.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      )}

      {info.email && (
        <div>
          <p className={labelClass}>Email</p>
          <a
            href={`mailto:${info.email}`}
            className={`${valueClass} block hover:text-sky-600 transition-colors`}
          >
            {info.email}
          </a>
        </div>
      )}

      {info.phone && (
        <div>
          <p className={labelClass}>{phoneLabel}</p>
          <a
            href={telHref(info.phone)}
            className={`${valueClass} block hover:text-sky-600 transition-colors`}
          >
            {info.phone}
          </a>
        </div>
      )}

      {info.phone2 && (
        <div>
          <p className={labelClass}>Phone 2</p>
          <a
            href={telHref(info.phone2)}
            className={`${valueClass} block hover:text-sky-600 transition-colors`}
          >
            {info.phone2}
          </a>
        </div>
      )}
    </div>
  );
}

export function ContactSocialLinks({
  info,
  className = "",
  iconClass = "h-6 w-6",
  variant = "default",
}: {
  info: StoreContactInfo;
  className?: string;
  iconClass?: string;
  variant?: "default" | "plain" | "contact";
}) {
  const links = [
    {
      key: "facebook",
      href: info.social.facebook,
      label: "Facebook",
      icon: (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      href: info.social.instagram,
      label: "Instagram",
      icon: (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      href: whatsappHref(info.social.whatsapp),
      label: "WhatsApp",
      icon: (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  const linkClass =
    variant === "plain"
      ? "flex h-9 w-9 items-center justify-center text-black transition hover:opacity-75"
      : variant === "contact"
        ? "inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black transition hover:border-sky-400 hover:bg-sky-400 hover:text-white"
        : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white";

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          aria-label={link.label}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export function whatsappLink(value: string): string {
  return whatsappHref(value);
}
