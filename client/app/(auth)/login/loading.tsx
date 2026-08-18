import BrandLogo from "@/components/auth/BrandLogo";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import GlassCard from "@/components/common/GlassCard";

export default function LoginLoading() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0B1130] px-4">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#3D5AFE]/15 blur-[180px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#00D9C0]/15 blur-[180px]" />

      <GlassCard className="flex flex-col items-center justify-center p-10 max-w-sm w-full text-center space-y-6">
        <BrandLogo size="lg" />
        <div className="flex items-center gap-3 text-sm text-[#8A90A6]">
          <LoadingSpinner size="md" />
          <span>Loading authentication system...</span>
        </div>
      </GlassCard>
    </div>
  );
}
