export default function SocialLogin() {
  return (
    <div>

      <div className="my-6 flex items-center">

        <div className="h-px flex-1 bg-white/10" />

        <span className="px-4 text-sm text-slate-400">
          OR
        </span>

        <div className="h-px flex-1 bg-white/10" />

      </div>

      <button className="mb-3 w-full rounded-xl border border-white/10 py-3 text-white hover:bg-white/5">
        Continue with Google
      </button>

      <button className="w-full rounded-xl border border-white/10 py-3 text-white hover:bg-white/5">
        Continue with LinkedIn
      </button>

    </div>
  );
}