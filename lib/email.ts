import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? 'TipDee <noreply@tipdee.app>';
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    // Development fallback: just log
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await sendEmail(
    email,
    'ยืนยันอีเมลของคุณ — TipDee',
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #22c55e; font-size: 28px;">🟢 TipDee</h1>
      <h2>สวัสดี ${name}!</h2>
      <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #22c55e; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
        ✅ ยืนยันอีเมล
      </a>
      <p style="color: #94a3b8; font-size: 12px;">หากคุณไม่ได้สมัครสมาชิก TipDee กรุณาเพิกเฉยต่ออีเมลนี้</p>
    </div>
    `
  );
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'รีเซ็ตรหัสผ่านของคุณ — TipDee',
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #fff; padding: 32px; border-radius: 12px;">
      <h1 style="color: #22c55e; font-size: 28px;">🟢 TipDee</h1>
      <h2>สวัสดี ${name}!</h2>
      <p>เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
      <a href="${resetUrl}" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
        🔑 รีเซ็ตรหัสผ่าน
      </a>
      <p style="color: #94a3b8; font-size: 12px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
    </div>
    `
  );
}
