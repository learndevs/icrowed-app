import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "./AdminSidebar";

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
    <div className="flex h-screen overflow-hidden bg-[var(--surface)]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[var(--border)] px-6 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-base">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)] hidden sm:block">
              {user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--brand-100)] flex items-center justify-center text-sm font-bold text-[var(--brand-700)]">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
