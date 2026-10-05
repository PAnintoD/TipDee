'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [err, setErr] = useState('');

  function getErrorMessage(errParam: string | null, manualErr: string) {
    if (manualErr) return manualErr;
    if (!errParam) return '';
    switch (errParam) {
      case 'Configuration':
        return 'ระบบยังไม่ได้ตั้งค่า Google Client ID & Secret ใน .env.local';
      case 'AccessDenied':
        return 'การเข้าสู่ระบบถูกปฏิเสธ';
      case 'OAuthSignin':
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google กรุณาตรวจสอบ Client ID / Secret หรือลองใหม่อีกครั้ง';
      case 'OAuthAccountNotLinked':
        return 'อีเมลนี้ถูกใช้งานด้วยวิธีเข้าสู่ระบบอื่นแล้ว กรุณาใช้อีเมลและรหัสผ่าน';
      case 'token_expired':
        return 'ลิงก์หมดอายุแล้ว กรุณาลองใหม่อีกครั้ง';
      default:
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErr('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    try {
      setOauthLoading(true);
      setErr('');
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (e) {
      console.error(e);
      setErr('เกิดข้อผิดพลาดในการเริ่มเข้าสู่ระบบด้วย Google');
      setOauthLoading(false);
    }
  }

  return (
    <div className="surface-card p-6 sm:p-8 rounded-2xl shadow-xl">
      <h1 className="text-xl font-bold tracking-tight text-white mb-1">เข้าสู่ระบบ</h1>
      <p className="text-slate-400 text-xs mb-6">ยินดีต้อนรับกลับสู่ระบบ TipDee Studio</p>

      {verified && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-xs">
          ✅ ยืนยันอีเมลสำเร็จแล้ว เข้าสู่ระบบได้ทันที
        </div>
      )}

      {(err || error) && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs flex items-center justify-between gap-2">
          <span>{getErrorMessage(error, err)}</span>
          <button
            type="button"
            onClick={() => { setErr(''); router.replace('/login'); }}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/[0.06] transition-colors"
            title="ปิดการแจ้งเตือน"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">รหัสผ่าน</label>
            <a href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
              ลืมรหัสผ่าน?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-500">
          <span className="bg-[#0e131d] px-3">หรือเข้าสู่ระบบด้วย</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading || oauthLoading}
        className="w-full bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-xs font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2.5"
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>{oauthLoading ? 'กำลังเชื่อมต่อกับ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
      </button>

      <p className="text-center text-xs text-slate-400 mt-5">
        ยังไม่มีบัญชี?{' '}
        <a href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
          สมัครสมาชิกใหม่
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
