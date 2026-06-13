import { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get("host") || "pg-room-platform.vercel.app";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tenant/", "/owner/", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
