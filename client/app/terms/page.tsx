import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service and user agreement for SKILLEZO.AI career intelligence platform.",
  alternates: {
    canonical: "https://www.skillezo.com/terms",
  },
  openGraph: {
    title: "Terms of Service | SKILLEZO.AI",
    description: "Official Terms of Service and usage agreement for SKILLEZO.AI.",
    url: "https://www.skillezo.com/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080d28] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#00D9C0] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#00D9C0] mb-4">
            <FileText className="w-3.5 h-3.5" /> Legal & Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-[#8A90A6]">
            Last updated: October 2026 • Effective immediately
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#B0B7C3] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Skillezo (&ldquo;Platform&rdquo;), a service provided by SKILLEDHYRE LABS /
              DEVAADYA TECHNOLOGIES PRIVATE LIMITED, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Use of Services</h2>
            <p>
              Skillezo provides AI-powered resume enhancement, employability assessments, and recruiter matching.
              You agree to provide accurate information and not misrepresent your credentials, employment history,
              or identity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify
              us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Intellectual Property</h2>
            <p>
              All proprietary algorithms, design assets, trademarks, and documentation are owned by DEVAADYA
              TECHNOLOGIES PRIVATE LIMITED. You retain ownership of resumes and personal portfolio content uploaded by you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Inquiries & Support</h2>
            <p>
              For legal inquiries regarding these terms, contact us at:{" "}
              <a href="mailto:marketing.skilledhyre@gmail.com" className="text-[#00D9C0] underline">
                marketing.skilledhyre@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
