import { z } from "zod";

const serverSchema = z.object({
  /** Postgres connection string. */
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (s) => /^postgres(ql)?:\/\//i.test(s.trim()),
      "DATABASE_URL must start with postgres:// or postgresql://",
    ),
  /** Signs Better Auth sessions — generate with `openssl rand -base64 32`. */
  BETTER_AUTH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
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
  /** Google Search Console HTML meta verification token (content value only). */
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z
    .string()
    .optional()
    .transform((s) => (s == null ? "" : s.trim())),
  /** GA4 measurement id (`G-XXXXXXXXXX`). Empty disables analytics. */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .optional()
    .transform((s) => (s == null ? "" : s.trim())),
});

// Client env — safe to expose to the browser
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});

// Server env — call only in server-side code (API routes, Server Components)
export function getServerEnv() {
  return serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });
}

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
