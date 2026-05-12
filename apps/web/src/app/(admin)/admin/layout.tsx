import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const [profile] = await db
    .select({ role: profiles.role, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile || profile.role !== "admin") redirect("/");

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user.email?.[0] ?? "A").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        fullName={profile.fullName ?? null}
        email={user.email ?? ""}
        initials={initials}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          fullName={profile.fullName ?? null}
          email={user.email ?? ""}
          initials={initials}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
