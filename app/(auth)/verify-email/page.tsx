import { Suspense } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyContent({ searchParams }: { searchParams: { error?: string } }) {
  const isError = !!searchParams.error;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
      {isError ? (
        <>
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">ยืนยันอีเมลไม่สำเร็จ</h2>
          <p className="text-slate-400 mb-6">ลิงก์หมดอายุแล้วหรือไม่ถูกต้อง กรุณาสมัครใหม่หรือขอลิงก์ใหม่</p>
        </>
      ) : (
        <>
          <CheckCircle className="h-16 w-16 text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">ยืนยันอีเมลสำเร็จ!</h2>
          <p className="text-slate-400 mb-6">บัญชีของคุณพร้อมใช้งานแล้ว</p>
        </>
      )}
      <a href="/login" className="inline-block bg-brand-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-brand-600 transition-colors">
        ไปหน้าเข้าสู่ระบบ
      </a>
    </div>
  );
}

export default function VerifyEmailPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <Suspense>
      <VerifyContent searchParams={searchParams} />
    </Suspense>
  );
}
