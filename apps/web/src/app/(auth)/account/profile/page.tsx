"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, User } from "lucide-react";

interface ProfileData {
  fullName: string;
  phone: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({ fullName: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button size="icon" variant="outline" onClick={() => router.push("/account")}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Update your personal details</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--muted)] text-sm">Loading…</div>
      ) : (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--brand-100)] flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="font-semibold">{profile.fullName || "No name set"}</p>
                <p className="text-sm text-[var(--muted)]">{profile.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Sandun Perera"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input
                  type="tel"
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="+94 77 123 4567"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  disabled
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)] cursor-not-allowed"
                  value={profile.email}
                />
                <p className="text-xs text-[var(--muted)] mt-1">Email cannot be changed here.</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              {saved && (
                <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Profile updated successfully.</p>
              )}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
