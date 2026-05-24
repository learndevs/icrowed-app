import "server-only";

const DEFAULT_ATTEMPTS = 3;
const BASE_DELAY_MS = 400;

/**
 * Run a storefront DB query with retries. On persistent failure, throws so Next.js
 * ISR does not cache an empty catalog page after a transient Supabase timeout.
 */
export async function queryStorefront<T>(
  label: string,
  fn: () => Promise<T>,
  opts?: { attempts?: number },
): Promise<T> {
  const attempts = opts?.attempts ?? DEFAULT_ATTEMPTS;
  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(
        `[storefront:${label}] attempt ${i + 1}/${attempts} failed:`,
        err instanceof Error ? err.message : err,
      );
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, BASE_DELAY_MS * (i + 1)));
      }
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Storefront query failed: ${label}`);
}
