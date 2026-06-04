/** Client-side auth session helpers (cookie is httpOnly; use /api/auth/me). */

export type CustomerUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export const AUTH_CHANGE_EVENT = "icrowd-auth-change";

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export async function fetchCustomerUser(): Promise<CustomerUser | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: CustomerUser | null };
    return data.user;
  } catch {
    return null;
  }
}

export async function customerSignOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  notifyAuthChange();
}
