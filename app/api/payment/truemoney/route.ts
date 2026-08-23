import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(10),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { phone, amount } = parsed.data;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const url = `https://payment.truemoney.com/donate/?msisdn=${cleanPhone}&amount=${amount.toFixed(2)}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 300,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return NextResponse.json({ success: true, url, qrDataUrl });
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
