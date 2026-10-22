import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.skillezo.com";

  return {
    rules: [
      {
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
          "/account-suspended",
          "/resume-studio",
          "/resume-studio/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/privacy", "/terms"],
        disallow: [
          "/dashboard/*",
          "/recruiter/*",
          "/admin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
