import { LOYALTY_NAME } from "@/lib/loyalty-brand";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AccountNav } from "@/components/account/AccountNav";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { getSessionUser } from "@/lib/session";
import { getLoyaltySummary } from "@icrowd/database/queries";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata("Account");

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const [user, contactInfo] = await Promise.all([
    getSessionUser(),
    getStorefrontContactInfoSafe(),
  ]);
  if (!user) redirect("/login?next=/account");

  const loyalty = await getLoyaltySummary(user.id);
  const name = user.name || user.email.split("@")[0];
  const initials = (
    user.name
      ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
      : user.email[0]
  ).toUpperCase();

  return (
    <>
      <Header />
      <main className="flex-1 min-h-0">
        <div className="acct-bg">
          <div className="px-3 sm:px-5 lg:px-8 py-6 lg:py-10 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">
            <AccountNav
              name={name}
              email={user.email}
              initials={initials}
              tierName={loyalty.settings.enabled && loyalty.tier ? `${LOYALTY_NAME} · ${loyalty.tier.name}` : null}
            />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer contactInfo={contactInfo} />
    </>
  );
}
