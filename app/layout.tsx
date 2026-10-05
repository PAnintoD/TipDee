import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TipDee - ระบบโดเนทสำหรับสตรีมเมอร์ & ครีเอเตอร์',
  description: 'ระบบรับเงินโดเนท พร้อมเพย์ Dynamic QR, สแกนสลิปออโต้, ซอง TrueMoney, แจ้งเตือนขึ้นจอ OBS Studio พร้อมเสียงอ่านข้อความ TTS ภาษาไทย',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
