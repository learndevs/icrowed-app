"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";

interface Props {
  userId: string;
  currentRole: "customer" | "operator" | "admin";
  isActive: boolean;
}

export function CustomerActions({ userId, currentRole, isActive }: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function saveRole() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/customers/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    if (!confirm(isActive ? "Deactivate this customer?" : "Reactivate this customer?")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/customers/${userId}/deactivate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-semibold text-sm">Account Actions</h3>
        {err && (
          <p className="text-xs text-[var(--color-error)] bg-red-50 p-2 rounded">{err}</p>
        )}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
            Role
          </label>
          <div className="flex gap-2">
            <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="customer">customer</option>
              <option value="operator">operator</option>
              <option value="admin">admin</option>
            </Select>
            <Button
              size="md"
              onClick={saveRole}
              loading={busy}
              disabled={role === currentRole}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--border)]">
          <Button
            variant={isActive ? "destructive" : "primary"}
            onClick={toggleActive}
            loading={busy}
            className="w-full"
          >
            {isActive ? "Deactivate account" : "Reactivate account"}
          </Button>
          <p className="text-xs text-[var(--muted)] mt-2">
            Deactivated accounts cannot place new orders. Their existing data is preserved.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
