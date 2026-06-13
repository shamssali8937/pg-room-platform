import { MetadataRoute } from "next";

const BASE_URL = "https://pg-room-platform.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/general/aboutus",
    "/general/contactus",
    "/general/privacypolicy",
    "/general/terms-and-conditions",
    "/auth/signin",
    "/auth/signup",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
