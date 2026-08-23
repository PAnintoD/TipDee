'use client';

import { useState } from 'react';
import { Loader2, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        username: form.username.toLowerCase(),
        displayName: form.displayName,
        password: form.password,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <CheckCircle className="h-16 w-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">สมัครสมาชิกสำเร็จ!</h2>
        <p className="text-slate-400 mb-6">เราส่งอีเมลยืนยันไปที่ <span className="text-white">{form.email}</span> แล้ว กรุณาตรวจสอบอีเมลของคุณ</p>
        <a href="/login" className="inline-block bg-brand-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-brand-600 transition-colors">
          ไปหน้าเข้าสู่ระบบ
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">สมัครสมาชิก</h1>
      <p className="text-slate-400 text-sm mb-6">สร้างบัญชีสตรีมเมอร์ฟรี ไม่มีค่าใช้จ่าย</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" required
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            ชื่อผู้ใช้ <span className="text-slate-500">(URL: /u/ชื่อผู้ใช้)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">tipdee.app/u/</span>
            <input
              type="text" name="username" value={form.username} onChange={handleChange}
              placeholder="myusername" required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 pl-28 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">ใช้ได้เฉพาะ a-z, 0-9 และ _ (ไม่มีช่องว่าง)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">ชื่อที่แสดง</label>
          <input
            type="text" name="displayName" value={form.displayName} onChange={handleChange}
            placeholder="ชื่อช่องของคุณ" required
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
              placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">ยืนยันรหัสผ่าน</label>
          <input
            type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            placeholder="••••••••" required
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
          สมัครสมาชิก
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        มีบัญชีแล้ว?{' '}
        <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
          เข้าสู่ระบบ
        </a>
      </p>
    </div>
  );
}
