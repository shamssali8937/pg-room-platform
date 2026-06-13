import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || url.host;
  const baseUrl = `${protocol}://${host}`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /tenant/
Disallow: /owner/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robotsTxt.trim(), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
