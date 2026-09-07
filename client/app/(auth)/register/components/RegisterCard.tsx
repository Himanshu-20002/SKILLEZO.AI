"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import RegisterForm from "./RegisterForm";
import Divider from "@/components/auth/Divider";
import SocialButton from "@/components/auth/SocialButton";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthRole = "candidate" | "recruiter";

export default function RegisterCard() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "recruiter" ? "recruiter" : "candidate";
  const [activeRole, setActiveRole] = useState<AuthRole>(initialRole);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "recruiter") {
      setActiveRole("recruiter");
    } else if (roleParam === "candidate") {
      setActiveRole("candidate");
    }
  }, [searchParams]);

  return (
    <AuthCard className="max-w-md w-full">
      {/* Role Switcher */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#090E24]/90 border border-white/10 h-14 items-center">
        <button
          type="button"
          onClick={() => setActiveRole("candidate")}
          className={cn(
            "h-11 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
            activeRole === "candidate"
              ? "bg-[#3D5AFE] text-white shadow-[0_0_18px_rgba(61,90,254,0.4)] border border-[#3D5AFE]/40"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span>Candidate</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRole("recruiter")}
          className={cn(
            "h-11 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
            activeRole === "recruiter"
              ? "bg-[#3D5AFE] text-white shadow-[0_0_18px_rgba(61,90,254,0.4)] border border-[#3D5AFE]/40"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>Recruiter</span>
        </button>
      </div>

      {/* Header with Stable Fixed Height Container */}
      <div className="min-h-[88px] sm:min-h-[92px] flex flex-col justify-start">
        <AuthHeader
          key={activeRole}
          className="transition-opacity duration-200"
          title={activeRole === "recruiter" ? "Recruiter Signup 🏢" : "Create Account 🚀"}
          subtitle={
            activeRole === "recruiter"
              ? "Create your employer workspace to source verified talent and stream resumes."
              : "Create your candidate account to verify skills and get hired by top companies."
          }
        />
      </div>

      {/* Main Registration Form */}
      <RegisterForm activeRole={activeRole} />

      {/* Social Divider */}
      <Divider label="Or continue with" />

      {/* Social OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <SocialButton provider="google" label="Google" />
        <SocialButton provider="linkedin" label="LinkedIn" />
      </div>

      {/* Footer Navigation Link */}
      <div className="pt-1 text-center text-xs sm:text-sm text-[#8A90A6]">
        Already have an account?{" "}
        <Link
          href={`/login?role=${activeRole}`}
          className="font-medium text-[#00D9C0] hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer ml-1"
        >
          Sign In
        </Link>
      </div>
    </AuthCard>
  );
}

