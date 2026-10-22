import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";
import { AuthTokenBridge } from "@/components/auth/AuthTokenBridge";
import { JsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  themeColor: "#0B1130",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.skillezo.com"),
  title: {
    default: "SKILLEZO.AI — Know Your Employability Score. Get Hired with AI Career Intelligence",
    template: "%s | SKILLEZO.AI",
  },
  description:
    "AI career intelligence that benchmarks your profile against real hiring data. Calculate your Employability Index, verify skills cryptographically, and get hired faster.",
  applicationName: "SKILLEZO.AI",
  authors: [
    { name: "SkilledHyre Labs" },
    { name: "DEVAADYA TECHNOLOGIES PRIVATE LIMITED" },
  ],
  generator: "Next.js",
  keywords: [
    "AI Career Intelligence",
    "Employability Score",
    "Employability Index",
    "Resume Analyzer",
    "Career GPS",
    "Job Readiness",
    "Skill Verification",
    "Cryptographic Certificate",
    "Tech Recruitment",
    "SkilledHyre",
    "Software Engineer Jobs",
  ],
  creator: "SkilledHyre Labs",
  publisher: "SKILLEZO.AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.skillezo.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.skillezo.com",
    siteName: "SKILLEZO.AI",
    title: "SKILLEZO.AI — Know Your Employability Score. Get Hired with AI Career Intelligence",
    description:
      "AI career intelligence that benchmarks your profile against real hiring data. Calculate your Employability Index, verify skills cryptographically, and get hired faster.",
    images: [
      {
        url: "/skillezo-logo.png",
        width: 1200,
        height: 630,
        alt: "SKILLEZO.AI — Know Your Employability Score. Get Hired.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKILLEZO.AI — Know Your Employability Score. Get Hired.",
    description:
      "AI career intelligence that benchmarks your profile against real hiring data. Calculate your Employability Index, verify skills cryptographically, and get hired faster.",
    creator: "@skillezo_ai",
    images: ["/skillezo-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-white selection:bg-[#3D5AFE]/30 selection:text-white transition-colors duration-200">
        <AuthTokenBridge />
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
