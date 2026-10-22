import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.skillezo.com";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date("2026-10-22T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-10-22T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-10-22T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
