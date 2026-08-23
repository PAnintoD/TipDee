export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white">
            <span className="text-brand-400">Tip</span>Dee
          </a>
          <p className="text-slate-400 text-sm mt-1">ระบบโดเนทสำหรับสตรีมเมอร์</p>
        </div>
        {children}
      </div>
    </div>
  );
}
