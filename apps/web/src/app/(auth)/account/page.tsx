import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, User, MapPin, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const displayName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "My Account";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: "/track",
            icon: Package,
            label: "My Orders",
            sub: "Track & view order history",
          },
          {
            href: "/account/profile",
            icon: User,
            label: "Profile",
            sub: "Name, phone, password",
          },
          {
            href: "/account/addresses",
            icon: MapPin,
            label: "Addresses",
            sub: "Saved delivery addresses",
          },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-[var(--color-primary)] transition-colors cursor-pointer h-full">
              <CardContent className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-50)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-[var(--muted)]">{sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
