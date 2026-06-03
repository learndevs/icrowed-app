import { z } from "zod";

const serverSchema = z.object({
  /** Postgres connection string (Supabase "URI" from dashboard, or local). */
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (s) => /^postgres(ql)?:\/\//i.test(s.trim()),
      "DATABASE_URL must start with postgres:// or postgresql://",
    ),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  RESEND_API_KEY: z.string().startsWith("re_"),
  /** Plain email or `Name <email@domain.com>` — must be verified in Resend. */
  EMAIL_FROM: z
    .string()
    .min(3)
    .refine(
      (s) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ||
        /^.+<[^\s@]+@[^\s@]+\.[^\s@]+>$/.test(s.trim()),
      "EMAIL_FROM must be an email or Name <email@domain.com>",
    ),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  /** Empty until you add a real key (`pk_test_…` / `pk_live_…`). Required for card checkout in the browser. */
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .transform((s) => (s == null ? "" : s.trim()))
    .pipe(
      z.union([
        z.literal(""),
        z.string().startsWith("pk_", { message: 'must start with "pk_"' }),
      ]),
    ),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Client env — safe to expose to the browser
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// Server env — call only in server-side code (API routes, Server Components)
export function getServerEnv() {
  return serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });
}

/** Supabase Storage admin ops (e.g. product images) — does not require Stripe/Resend. */
export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in apps/web/.env.local");
  }
  return key;
}

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
