import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginCard from "./components/LoginCard";

export const metadata = {
  title: "Login | SKILLEZO AI",
  description: "Sign in to SKILLEZO AI to access your AI skill verification dashboard and career insights.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="h-96 w-full max-w-md bg-white/5 animate-pulse rounded-3xl" />}>
        <LoginCard />
      </Suspense>
    </AuthLayout>
  );
}