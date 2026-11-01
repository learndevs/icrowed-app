import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
  emailVerified: boolean;
};

/** Current signed-in user (any role) or null. Use in server components and route handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user as
    | (Record<string, unknown> & { id: string; email: string })
    | undefined;
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: (u.name as string) ?? "",
    image: (u.image as string | null) ?? null,
    role: (u.role as string) ?? "customer",
    emailVerified: Boolean(u.emailVerified),
  };
}
