import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pg-room-platform.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tenant/", "/owner/", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
