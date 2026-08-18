import AuthLayout from "@/components/auth/AuthLayout";
import RegisterCard from "./components/RegisterCard";

export const metadata = {
  title: "Register | SKILLEZO AI",
  description: "Create your SKILLEZO AI account to get started with automated AI skill verification and enterprise talent benchmarks.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterCard />
    </AuthLayout>
  );
}
