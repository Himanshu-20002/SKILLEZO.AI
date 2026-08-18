"use client";

import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "./LoginForm";
import Divider from "@/components/auth/Divider";
import SocialButton from "@/components/auth/SocialButton";

export default function LoginCard() {
  return (
    <AuthCard className="max-w-md w-full">
      {/* Header */}
      <AuthHeader
        title="Welcome Back 👋"
        subtitle="Sign in to continue your AI career journey."
      />

      {/* Main Login Form */}
      <LoginForm />

      {/* Social Divider */}
      <Divider label="Or continue with" />

      {/* Social OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <SocialButton provider="google" label="Google" />
        <SocialButton provider="linkedin" label="LinkedIn" />
      </div>

      {/* Footer Navigation Link */}
      <div className="pt-2 text-center text-xs sm:text-sm text-[#8A90A6]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#00D9C0] hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer ml-1"
        >
          Sign Up
        </Link>
      </div>
    </AuthCard>
  );
}