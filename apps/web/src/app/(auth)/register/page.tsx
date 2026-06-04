"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { Suspense } from "react";
import { publicLoginError } from "@/lib/auth-errors";

function RegisterForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleResend() {
    if (!pendingEmail) return;
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) setError(data.error ?? "Could not resend email.");
      else setError(null);
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, phone: phone || undefined }),
    });

    const data = (await res.json()) as {
      error?: string;
      needsVerification?: boolean;
      email?: string;
    };

    if (!res.ok) {
      setError(publicLoginError(res.status, data.error));
      setLoading(false);
      return;
    }

    setPendingEmail(data.email ?? email);
    setLoading(false);
  }

  if (pendingEmail) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-lg font-bold">Check your email</h2>
          <p className="text-sm text-[var(--muted)]">
            We sent a verification link to <strong>{pendingEmail}</strong>. Open it to
            activate your account, then sign in.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendLoading}
            onClick={handleResend}
          >
            {resendLoading ? "Sending…" : "Resend verification email"}
          </Button>
          <Link
            href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="block"
          >
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">Create account</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Join iCrowd to start shopping</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jone Doe"
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 77 123 4567"
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-10 px-3 pr-10 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        iCrowd
      </Link>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
