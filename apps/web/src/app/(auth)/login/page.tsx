"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eye, EyeOff, Smartphone, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type MfaMode = "password" | "verify" | "enroll";

type MfaEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

function qrCodeSrc(qrCode: string) {
  if (qrCode.startsWith("data:")) return qrCode;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const isAdminLogin = next.startsWith("/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<MfaMode>("password");
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : params.get("mfa") === "required"
        ? "Enter your admin verification code to continue."
        : null
  );

  useEffect(() => {
    if (!isAdminLogin) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      void prepareAdminMfa(supabase);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLogin]);

  async function getProfileRole() {
    const res = await fetch("/api/profile");
    if (!res.ok) return null;
    const profile = await res.json();
    return profile.role as string | null;
  }

  async function prepareAdminMfa(supabase: SupabaseClient) {
    setLoading(true);
    setError(null);

    try {
      const role = await getProfileRole();
      if (role !== "admin") {
        router.push(next);
        router.refresh();
        return;
      }

      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      if (aal.currentLevel === "aal2") {
        router.push(next);
        router.refresh();
        return;
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedTotp = factors.totp[0];
      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setMode("verify");
        return;
      }

      const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "iCrowed Admin",
        issuer: "iCrowed",
      });
      if (enrollError) throw enrollError;

      setEnrollment({
        factorId: enrolled.id,
        qrCode: qrCodeSrc(enrolled.totp.qr_code),
        secret: enrolled.totp.secret,
      });
      setMode("enroll");
      setError("Set up multi-factor authentication to continue to admin.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to prepare admin verification.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (isAdminLogin) {
      await prepareAdminMfa(supabase);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = mfaCode.replace(/\s/g, "");
    if (!code) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (mode === "verify") {
        if (!factorId) throw new Error("Missing MFA factor.");
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code,
        });
        if (error) throw error;
      } else {
        if (!enrollment) throw new Error("Missing MFA enrollment.");
        const challenge = await supabase.auth.mfa.challenge({
          factorId: enrollment.factorId,
        });
        if (challenge.error) throw challenge.error;

        const { error } = await supabase.auth.mfa.verify({
          factorId: enrollment.factorId,
          challengeId: challenge.data.id,
          code,
        });
        if (error) throw error;
      }

      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function backToPassword() {
    await createClient().auth.signOut();
    setMode("password");
    setMfaCode("");
    setFactorId(null);
    setEnrollment(null);
    setPassword("");
    setError(null);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">
            {mode === "password" ? "Welcome back" : "Admin verification"}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {mode === "password"
              ? "Sign in to your iCrowed account"
              : "Use your authenticator app to continue"}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {mode === "password" ? (
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
        ) : (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            {mode === "enroll" && enrollment && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-3">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-900">
                    Scan this QR code with Google Authenticator, 1Password, Authy,
                    or another TOTP app, then enter the generated code.
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollment.qrCode}
                  alt="Admin MFA QR code"
                  className="mx-auto h-44 w-44 rounded-lg border border-[var(--border)] bg-white p-2"
                />
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Manual setup key
                  </label>
                  <input
                    readOnly
                    value={enrollment.secret}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-mono"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Verification code</label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full h-11 px-3 rounded-lg border border-[var(--border)] bg-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </Button>
            <button
              type="button"
              onClick={backToPassword}
              className="w-full text-center text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Sign in with a different account
            </button>
          </form>
        )}

        {mode === "password" && (
          <p className="text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${next !== "/" ? `?next=${next}` : ""}`}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        )}
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
        iCrowed
      </Link>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
