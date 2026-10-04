export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-black text-slate-950 text-xs shadow-sm">
              TD
            </span>
            <span>Tip<span className="text-emerald-400">Dee</span></span>
          </a>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">ระบบโดเนทและ Alert Box สำหรับครีเอเตอร์ไทย</p>
        </div>
        {children}
      </div>
    </div>
  );
}
