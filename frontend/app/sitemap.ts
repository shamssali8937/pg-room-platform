import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://pg-room-platform.vercel.app");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/general/aboutus", priority: 0.7, changeFrequency: "monthly" },
    { path: "/general/contactus", priority: 0.7, changeFrequency: "monthly" },
    {
      path: "/general/privacypolicy",
      priority: 0.5,
      changeFrequency: "yearly",
    },
    {
      path: "/general/terms-and-conditions",
      priority: 0.5,
      changeFrequency: "yearly",
    },
    { path: "/auth/signin", priority: 0.8, changeFrequency: "monthly" },
    { path: "/auth/signup", priority: 0.8, changeFrequency: "monthly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
