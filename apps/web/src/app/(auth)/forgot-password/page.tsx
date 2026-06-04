"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Smartphone } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = (await res.json()) as { error?: string; message?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface)] px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        iCrowd
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="text-sm text-[var(--muted)]">
                If an account exists for <strong>{email}</strong>, we sent password reset
                instructions. The link expires in 1 hour.
              </p>
              <Link href="/login">
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-xl font-bold">Forgot password</h1>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="text-center text-sm text-[var(--muted)]">
                <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
