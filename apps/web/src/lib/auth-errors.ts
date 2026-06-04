/** Never show SQL, stack traces, or query params on login UI. */
export function publicLoginError(status: number, serverMessage?: string): string {
  if (status === 401) return "Invalid email or password";
  if (status === 409) return serverMessage ?? "An account with this email already exists";
  if (status === 400) return serverMessage ?? "Please check your details and try again";
  if (serverMessage && isSafeClientMessage(serverMessage)) return serverMessage;
  return "Something went wrong. Please try again later.";
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
