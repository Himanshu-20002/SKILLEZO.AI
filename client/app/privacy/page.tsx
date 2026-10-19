import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Skillezo",
  description: "Privacy Policy for Skillezo AI career intelligence platform.",
};

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5" /> Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[#8A90A6]">
            Last updated: October 2026 • Effective immediately
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#B0B7C3] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Overview</h2>
            <p>
              Skillezo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a product of SKILLEDHYRE LABS,
              an innovation division of SKILLEDHYRE, operated by DEVAADYA TECHNOLOGIES PRIVATE LIMITED.
              We are committed to safeguarding your personal information and privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, uploading your resume,
              completing skill assessments, or contacting support. This includes your name, email address,
              professional experience, education history, and career goals.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Google OAuth & Authentication</h2>
            <p>
              When you choose to sign in using Google OAuth, we access only basic profile information (your name,
              email address, and avatar image) as authorized by your Google account consent. We do not access
              your private Google Drive files, emails, or contacts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. How We Use Information</h2>
            <p>
              We use your data to power AI-driven employability scoring, resume optimization, career roadmapping,
              and job matching. We never sell your personal data to third-party data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Contact Us</h2>
            <p>
              For privacy queries or data deletion requests, contact us at:{" "}
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
