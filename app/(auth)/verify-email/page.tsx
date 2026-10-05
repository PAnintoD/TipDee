import { Suspense } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyContent({ searchParams }: { searchParams: { error?: string } }) {
  const isError = !!searchParams.error;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
      {isError ? (
        <>
          <XCircle className="h-14 w-14 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">ยืนยันอีเมลไม่สำเร็จ</h2>
          <p className="text-slate-500 text-xs mb-6">ลิงก์หมดอายุแล้วหรือไม่ถูกต้อง กรุณาสมัครใหม่หรือขอลิงก์ใหม่</p>
        </>
      ) : (
        <>
          <CheckCircle className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">ยืนยันอีเมลสำเร็จ!</h2>
          <p className="text-slate-500 text-xs mb-6">บัญชีของคุณพร้อมใช้งานแล้ว</p>
        </>
      )}
      <a href="/login" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors shadow-xs">
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
