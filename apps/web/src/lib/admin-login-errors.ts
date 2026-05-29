/** Never show SQL, stack traces, or query params on the admin login UI. */
export function publicAdminLoginError(
  status: number,
  serverMessage?: string,
): string {
  if (status === 401) return "Invalid email or password";
  if (status === 400) return serverMessage ?? "Email and password are required";
  if (serverMessage && isSafeClientMessage(serverMessage)) return serverMessage;
  return "Unable to sign in. Please try again later.";
}

function isSafeClientMessage(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes("failed query")) return false;
  if (lower.includes("select ") && lower.includes(" from ")) return false;
  if (lower.includes("params:")) return false;
  if (lower.includes("syntax error")) return false;
  if (lower.includes("permission denied")) return false;
  if (lower.includes("relation ") && lower.includes("does not exist")) return false;
  return message.length <= 120;
}
