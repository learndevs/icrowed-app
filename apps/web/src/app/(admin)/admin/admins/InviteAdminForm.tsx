"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";

export function InviteAdminForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    role: "operator" as "admin" | "operator",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/admins/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg(`Invitation sent to ${form.email}.`);
      setForm({ email: "", fullName: "", role: "operator" });
      router.refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Invite admin</Button>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="font-semibold text-sm">Invite admin or operator</h3>
        {msg && (
          <p className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded p-2">
            {msg}
          </p>
        )}
        <FormField label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="ops@example.com"
          />
        </FormField>
        <FormField label="Full name (optional)">
          <Input
            value={form.fullName}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullName: e.target.value }))
            }
          />
        </FormField>
        <FormField label="Role" required>
          <Select
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({ ...f, role: e.target.value as typeof f.role }))
            }
          >
            <option value="operator">operator</option>
            <option value="admin">admin</option>
          </Select>
        </FormField>
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={submit} loading={busy}>
            Send invitation
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
