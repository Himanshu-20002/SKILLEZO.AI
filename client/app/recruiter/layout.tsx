import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruiter Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
