import { getOpenApiSpec } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  return Response.json(getOpenApiSpec(origin), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
