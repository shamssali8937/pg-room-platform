import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pg-room-platform.vercel.app";

  // Publicly crawlable routes on PG Nexus website
  const routes = [
    "",
    "/general/aboutus",
    "/general/contactus",
    "/general/privacypolicy",
    "/general/term&conditions",
    "/auth/signin",
    "/auth/signup",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
