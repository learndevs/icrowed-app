import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import {
  db,
  profiles,
  authSessions,
  authAccounts,
  authVerifications,
} from "@icrowd/database";
import { sendEmail } from "@/lib/email";
import { baseTemplate, button } from "@/lib/email-templates/base";

const baseURL =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "http://localhost:3000";

const isProd = process.env.NODE_ENV === "production";
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
);
/** Verified email is required in production unless explicitly disabled. */
const requireEmailVerification =
  (process.env.AUTH_REQUIRE_EMAIL_VERIFICATION ?? (isProd ? "true" : "false")) === "true";

function authEmail(opts: { to: string; subject: string; heading: string; body: string; label: string; url: string }) {
  void sendEmail({
    to: opts.to,
    subject: opts.subject,
    html: baseTemplate(`
      <h1 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700;">${opts.heading}</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;">${opts.body}</p>
      ${button(opts.label, opts.url)}
      <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">If you did not request this, you can ignore this email.</p>
    `),
  })
    .then((r) => {
      if (!r.ok) console.error("[auth email]", r.error);
    })
    .catch((err) => console.error("[auth email]", err));
}

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: profiles,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  advanced: {
    database: { generateId: "uuid" },
  },
  user: {
    fields: { name: "fullName", image: "avatarUrl" },
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "customer", input: false },
      isActive: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification,
    sendResetPassword: async ({ user, url }) => {
      authEmail({
        to: user.email,
        subject: "Reset your iCrowd password",
        heading: "Reset your password",
        body: "Click the button below to choose a new password. The link expires in 1 hour.",
        label: "Reset password",
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      authEmail({
        to: user.email,
        subject: "Verify your iCrowd email",
        heading: "Confirm your email address",
        body: `Hi ${user.name || "there"}, confirm your email to finish setting up your iCrowd account.`,
        label: "Verify email",
        url,
      });
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [u] = await db
            .select({ isActive: profiles.isActive })
            .from(profiles)
            .where(eq(profiles.id, session.userId));
          if (u && !u.isActive) return false;
          return { data: session };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export const googleAuthEnabled = googleConfigured;
