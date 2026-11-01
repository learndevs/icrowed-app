"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, User, Mail, Phone, ShieldCheck } from "lucide-react";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";

interface ProfileData {
  fullName: string;
  phone: string;
  email: string;
}

function getInitials(name: string, email: string) {
  if (name) return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (email?.[0] ?? "U").toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({ fullName: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) { router.push("/login?next=/account/profile"); return; }
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setProfile({ fullName: data.fullName ?? "", phone: data.phone ?? "", email: data.email ?? "" });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: profile.fullName, phone: profile.phone }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const initials = getInitials(profile.fullName, profile.email);

  return (
    <div>
      <AccountPageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your personal details"
        icon={User}
      />

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="acct-glass p-6 animate-pulse space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-black/5 mx-auto" />
            <div className="h-4 bg-black/5 rounded-full w-32 mx-auto" />
            <div className="h-3 bg-black/5 rounded-full w-40 mx-auto" />
          </div>
          <div className="xl:col-span-2 acct-glass p-6 animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-black/5 rounded-full w-20" />
                <div className="h-11 bg-black/5 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Identity */}
          <div className="acct-glass p-6 flex flex-col items-center text-center acct-rise">
            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-neutral-900 to-[var(--brand-600)] flex items-center justify-center shadow-xl shadow-sky-900/20 mb-4">
              {profile.fullName || profile.email ? (
                <span className="text-white font-black text-3xl">{initials}</span>
              ) : (
                <User className="w-9 h-9 text-white/80" />
              )}
            </div>
            <p className="font-black text-neutral-900 text-lg">{profile.fullName || "No name set"}</p>
            <p className="text-sm text-neutral-500 mt-1 truncate w-full">{profile.email}</p>

            <div className="w-full mt-6 pt-5 border-t border-black/5 space-y-3 text-left">
              {[
                { icon: Mail, text: profile.email || "—" },
                { icon: Phone, text: profile.phone || "Not set" },
                { icon: ShieldCheck, text: "Customer account" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--brand-600)]" />
                  </span>
                  <span className="text-neutral-600 truncate">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="xl:col-span-2 acct-glass p-6 sm:p-8 acct-rise" style={{ animationDelay: "60ms" }}>
            <h2 className="font-black text-neutral-900 text-lg mb-6">Edit details</h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Full name</label>
                  <input
                    type="text"
                    className="acct-input"
                    placeholder="Jone Doe"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    className="acct-input"
                    placeholder="+94 77 123 4567"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">
                    Email
                    <span className="ml-2 text-xs font-normal text-neutral-400">cannot be changed</span>
                  </label>
                  <input type="email" disabled className="acct-input" value={profile.email} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-sky-50/80 border border-sky-100 text-[var(--brand-800)] text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Profile updated successfully.
                </div>
              )}

              <div className="pt-5 border-t border-black/5 flex justify-end">
                <Button type="submit" className="h-11 px-8 text-sm font-semibold rounded-full" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
