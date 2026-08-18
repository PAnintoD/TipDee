import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EasyDonate - ระบบโดเนทสำหรับสตรีมเมอร์ & ครีเอเตอร์',
  description: 'ระบบรับเงินโดเนท พร้อมเพย์ Dynamic QR, ซอง TrueMoney, แจ้งเตือนขึ้นจอ OBS Studio พร้อมเสียงอ่านข้อความ TTS ภาษาไทย',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#090b10] text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
