import type { StoreSettingsRow } from "@icrowd/database";

export type ContactPageContent = {
  heading: string;
  subtitle: string;
  phone2: string;
};

export type StoreContactInfo = {
  heading: string;
  subtitle: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  phone2: string;
  social: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
};

const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  heading: "Contact Us",
  subtitle:
    "We are here to help. Reach out via phone, email, or social media.",
  phone2: "",
};

export function parseContactPage(raw: unknown): ContactPageContent {
  const data = (raw ?? {}) as Partial<ContactPageContent>;
  return {
    heading: data.heading?.trim() || DEFAULT_CONTACT_PAGE.heading,
    subtitle: data.subtitle?.trim() || DEFAULT_CONTACT_PAGE.subtitle,
    phone2: data.phone2?.trim() ?? "",
  };
}

export function parseStoreContactInfo(
  settings: StoreSettingsRow,
): StoreContactInfo {
  const page = parseContactPage(settings.contactPage);
  const social = (settings.socialLinks ?? {}) as Record<string, string>;

  return {
    heading: page.heading,
    subtitle: page.subtitle,
    addressLine1: settings.addressLine1?.trim() ?? "",
    addressLine2: settings.addressLine2?.trim() ?? "",
    city: settings.city?.trim() ?? "",
    country: settings.country?.trim() ?? "",
    email: settings.storeEmail?.trim() ?? "",
    phone: settings.supportPhone?.trim() ?? "",
    phone2: page.phone2,
    social: {
      facebook: social.facebook?.trim() ?? "",
      instagram: social.instagram?.trim() ?? "",
      whatsapp: social.whatsapp?.trim() ?? "",
    },
  };
}

export function formatAddress(info: StoreContactInfo): string {
  const parts = [
    info.addressLine1,
    info.addressLine2,
    [info.city, info.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  return parts.join("\n");
}

export const FALLBACK_CONTACT_INFO: StoreContactInfo = {
  heading: "Contact Us",
  subtitle:
    "We are here to help. Reach out via phone, email, or social media.",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  email: "",
  phone: "",
  phone2: "",
  social: { facebook: "", instagram: "", whatsapp: "" },
};
