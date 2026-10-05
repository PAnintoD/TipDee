import { prisma } from './prisma';
import crypto from 'crypto';

export interface WebhookDonationPayload {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  paymentMethod: string;
  createdAt: string;
  isTest?: boolean;
}

// Exponential backoff fetch helper with strict 5-second timeout
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 2): Promise<Response> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000), // 5s timeout per attempt
      });

      // If server error (5xx) and retries remain, exponential backoff
      if (res.status >= 500 && attempt < maxRetries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError || new Error('Webhook dispatch failed after retries');
}

/**
 * Sends a webhook notification to the streamer's configured Webhook URL (Discord / Custom API)
 */
export async function triggerStreamerWebhook(
  streamerIdOrUsername: string,
  donation: WebhookDonationPayload
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  try {
    const streamer = await prisma.streamer.findFirst({
      where: {
        OR: [{ id: streamerIdOrUsername }, { username: streamerIdOrUsername }],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        webhookUrl: true,
        widgetToken: true,
      },
    });

    if (!streamer || !streamer.webhookUrl) {
      return { success: false, message: 'ไม่ได้ตั้งค่า Webhook URL' };
    }

    const webhookUrl = streamer.webhookUrl.trim();

    // 1. Check if Discord Webhook
    if (webhookUrl.includes('discord.com/api/webhooks') || webhookUrl.includes('discordapp.com/api/webhooks')) {
      const isTest = donation.isTest;
      const embedColor = donation.amount >= 1000 ? 0xec4899 : donation.amount >= 300 ? 0xfacc15 : 0x22c55e;

      const discordPayload = {
        username: 'TipDee Notifier',
        avatar_url: 'https://tipdee.vercel.app/logo.png',
        embeds: [
          {
            title: isTest ? '🧪 [ทดสอบ] มีการแจ้งเตือนโดเนทใหม่!' : '🎉 มีผู้สนับสนุนโดเนทใหม่!',
            color: embedColor,
            fields: [
              {
                name: '👤 ผู้สนับสนุน',
                value: `**${donation.donorName || 'ผู้ไม่ประสงค์ออกนาม'}**`,
                inline: true,
              },
              {
                name: '💰 จำนวนเงิน',
                value: `**${donation.amount.toLocaleString('th-TH')} บาท**`,
                inline: true,
              },
              {
                name: '💳 ช่องทาง',
                value: donation.paymentMethod.toUpperCase(),
                inline: true,
              },
              {
                name: '💬 ข้อความ',
                value: donation.message ? `> ${donation.message}` : '*ไม่มีข้อความ*',
                inline: false,
              },
            ],
            footer: {
              text: `TipDee Donation Platform • ช่อง @${streamer.username}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetchWithRetry(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      return {
        success: res.ok,
        statusCode: res.status,
        message: res.ok ? 'ส่งแจ้งเตือนเข้า Discord สำเร็จ' : `Discord ตอบกลับรหัส ${res.status}`,
      };
    }

    // 2. Custom Developer Webhook (JSON format + Signature)
    const payload = {
      event: donation.isTest ? 'donation.test' : 'donation.completed',
      timestamp: new Date().toISOString(),
      streamer: {
        id: streamer.id,
        username: streamer.username,
        displayName: streamer.displayName,
      },
      data: donation,
    };

    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', streamer.widgetToken || 'tipdee_secret')
      .update(payloadString)
      .digest('hex');

    const res = await fetchWithRetry(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TipDee-Webhook/1.0',
        'X-TipDee-Event': payload.event,
        'X-TipDee-Signature': signature,
      },
      body: payloadString,
    });

    return {
      success: res.ok,
      statusCode: res.status,
      message: res.ok ? 'ส่ง Webhook สำเร็จ' : `Webhook ตอบกลับรหัส ${res.status}`,
    };
  } catch (err: any) {
    console.error('Webhook dispatch error', err);
    return {
      success: false,
      message: `Webhook error: ${err.message || 'Connection failed'}`,
    };
  }
}
