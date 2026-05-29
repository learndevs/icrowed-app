import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { getStaffFromSession } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const staff = await getStaffFromSession();

  if (!staff) redirect("/admin/login?next=/admin");

  if (staff.role !== "admin") redirect("/admin/login?next=/admin");

  const [profile] = await db
    .select({ role: profiles.role, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, staff.userId));

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (staff.email[0] ?? "A").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        fullName={profile?.fullName ?? null}
        email={staff.email}
        initials={initials}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          fullName={profile?.fullName ?? null}
          email={staff.email}
          initials={initials}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
