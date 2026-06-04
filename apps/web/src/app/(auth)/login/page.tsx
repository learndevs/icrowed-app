"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { Suspense } from "react";
import { notifyAuthChange } from "@/lib/auth-client";
import { publicLoginError } from "@/lib/auth-errors";

function loginErrorFromQuery(code: string | null): string | null {
  if (code === "auth_callback_failed") return "Sign in with your email and password.";
  if (code === "invalid_verify_token") return "That verification link is invalid or expired.";
  if (code === "verify_failed") return "We could not verify your email. Request a new link below.";
  return null;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  useEffect(() => {
    if (next.startsWith("/admin")) {
      const q = next !== "/admin" ? `?next=${encodeURIComponent(next)}` : "";
      router.replace(`/admin/login${q}`);
    }
  }, [next, router]);

  if (next.startsWith("/admin")) {
    return null;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    loginErrorFromQuery(params.get("error")),
  );
  const [info, setInfo] = useState<string | null>(() => {
    if (params.get("verified") === "1") return "Email verified. You can sign in now.";
    if (params.get("reset") === "1") return "Password updated. Sign in with your new password.";
    return null;
  });
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleResendVerification() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not resend verification email.");
        return;
      }
      setInfo(data.message ?? "Verification email sent.");
      setNeedsVerification(false);
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setNeedsVerification(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = (await res.json()) as {
      error?: string;
      code?: string;
      email?: string;
    };

    if (!res.ok) {
      if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        if (data.email) setEmail(data.email);
        setError(data.error ?? "Please verify your email before signing in.");
      } else {
        setError(publicLoginError(res.status, data.error));
      }
      setLoading(false);
      return;
    }

    notifyAuthChange();
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Sign in to your iCrowd account</p>
        </div>

        {info && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {needsVerification && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendLoading}
            onClick={handleResendVerification}
          >
            {resendLoading ? "Sending…" : "Resend verification email"}
          </Button>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-primary)] font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface)] px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        iCrowd
      </Link>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
