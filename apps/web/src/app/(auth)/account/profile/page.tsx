"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, CheckCircle2, AlertCircle, User, Mail, Phone, Shield } from "lucide-react";
import Link from "next/link";

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
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-350 mx-auto">

        {/* Breadcrumb */}
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Account
        </Link>

        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest text-teal-500 uppercase">Account</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal details</p>
        </div>

        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bento-card p-6 animate-pulse space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 mx-auto" />
              <div className="h-4 bg-gray-100 rounded-full w-32 mx-auto" />
              <div className="h-3 bg-gray-100 rounded-full w-40 mx-auto" />
            </div>
            <div className="lg:col-span-2 bento-card p-6 animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded-full w-20" />
                  <div className="h-11 bg-gray-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Identity panel ── */}
            <div className="flex flex-col gap-4">
              <div className="bento-card p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mb-4">
                  {profile.fullName || profile.email ? (
                    <span className="text-white font-black text-2xl">{initials}</span>
                  ) : (
                    <User className="w-8 h-8 text-white/80" />
                  )}
                </div>
                <p className="font-black text-gray-900 text-lg">{profile.fullName || "No name set"}</p>
                <p className="text-sm text-gray-400 mt-1 truncate w-full">{profile.email}</p>
              </div>

              {/* Info pills */}
              <div className="bento-card p-5 space-y-3">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Details</p>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-gray-600 truncate">{profile.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-teal-500" />
                  </div>
                  <span className="text-gray-600">{profile.phone || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-gray-600">Customer</span>
                </div>
              </div>
            </div>

            {/* ── Right: Edit form ── */}
            <div className="lg:col-span-2 bento-card p-6">
              <h2 className="font-black text-gray-900 text-lg mb-5">Edit Details</h2>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Sandun Perera"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="+94 77 123 4567"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Email
                      <span className="ml-2 text-xs font-normal text-gray-400">cannot be changed</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                      value={profile.email}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {saved && (
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Profile updated successfully.
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button type="submit" className="h-11 px-8 text-sm font-semibold" disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
