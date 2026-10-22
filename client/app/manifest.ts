import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SKILLEZO.AI — Know Your Employability Score. Get Hired.",
    short_name: "SKILLEZO",
    description:
      "AI career intelligence that benchmarks your profile against live hiring data, calculates your Employability Index, and provides a step-by-step Career GPS.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1130",
    theme_color: "#0B1130",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
