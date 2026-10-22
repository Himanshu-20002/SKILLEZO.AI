import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.skillezo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/recruiter",
        "/recruiter/*",
        "/admin",
        "/admin/*",
        "/api",
        "/api/*",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/account-suspended",
        "/resume-studio",
        "/resume-studio/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
