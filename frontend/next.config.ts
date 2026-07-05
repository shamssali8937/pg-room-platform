import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    const scriptSrc = ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"];
    if (isDev) {
      scriptSrc.push("'unsafe-eval'");
    }

    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            // Prevent MIME-type sniffing — stops browsers interpreting files as
            // a different MIME type than declared (a common XSS vector).
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Prevent this page from being embedded in iframes (clickjacking).
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Limit referrer information sent on cross-origin navigation.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restrict access to sensitive browser APIs.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Force HTTPS for 1 year; include subdomains.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            // Content-Security-Policy — front-end layer.
            // Blocks execution of inline scripts not from self, CDNs, or known sources.
            // 'unsafe-inline' is required for Next.js App Router hydration.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc.join(" ")}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://res.cloudinary.com https://ui-avatars.com https://images.unsplash.com https://*.tile.openstreetmap.org",
              "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000") + " wss: ws:",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

