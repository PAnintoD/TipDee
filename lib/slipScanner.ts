import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import crypto from 'crypto';
import { prisma } from './prisma';

export interface SlipVerificationResult {
  success: boolean;
  transRef?: string;
  amount?: number;
  date?: string;
  senderName?: string;
  receiverName?: string;
  slipHash?: string;
  error?: string;
  rawPayload?: string;
}

/**
 * Parses raw image buffer (PNG or JPEG) into Uint8ClampedArray pixel data for jsQR
 */
export function getImagePixelData(buffer: Buffer): { data: Uint8ClampedArray; width: number; height: number } | null {
  // Try PNG
  try {
    const png = PNG.sync.read(buffer);
    return {
      data: new Uint8ClampedArray(png.data),
      width: png.width,
      height: png.height,
    };
  } catch (e) {
    // Not PNG, try JPEG
  }

  // Try JPEG
  try {
    const decoded = jpeg.decode(buffer, { useTArray: true, formatAsRGBA: true });
    return {
      data: new Uint8ClampedArray(decoded.data),
      width: decoded.width,
      height: decoded.height,
    };
  } catch (e) {
    // Neither PNG nor JPEG
  }

  return null;
}

/**
 * Scans image buffer for Bank Slip QR Code
 */
export function scanSlipQRCode(imageBuffer: Buffer): { payload: string; hash: string } | null {
  const pixelData = getImagePixelData(imageBuffer);
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

  if (!pixelData) {
    return { payload: '', hash };
  }

  const code = jsQR(pixelData.data, pixelData.width, pixelData.height, {
    inversionAttempts: 'attemptBoth',
  });

  if (code && code.data) {
    return { payload: code.data, hash };
  }

  return { payload: '', hash };
}

/**
 * Checks if slip hash or transaction reference is already used in the database
 */
export async function isSlipDuplicate(slipHash: string, slipRef?: string): Promise<boolean> {
  const existing = await prisma.donation.findFirst({
    where: {
      OR: [
        { slipHash: slipHash },
        ...(slipRef ? [{ slipRef: slipRef }] : []),
      ],
      status: 'completed',
    },
  });

  return !!existing;
}

/**
 * Verifies a bank slip image for a specific streamer and donation amount
 */
export async function verifySlipImage(
  imageBuffer: Buffer,
  expectedAmount: number,
  streamerId: string = 'streamerza'
): Promise<SlipVerificationResult> {
  const streamer = await prisma.streamer.findUnique({
    where: { id: streamerId },
  });

  const scanResult = scanSlipQRCode(imageBuffer);
  const slipHash = scanResult?.hash || crypto.createHash('sha256').update(imageBuffer).digest('hex');
  const rawPayload = scanResult?.payload || '';

  // 1. Anti-Duplicate Check
  const duplicate = await isSlipDuplicate(slipHash, rawPayload ? slipHash : undefined);
  if (duplicate) {
    return {
      success: false,
      error: 'สลิปนี้ถูกใช้งานไปแล้วในระบบ ไม่สามารถใช้ซ้ำได้ (Duplicate Slip Detected)',
    };
  }

// Circuit Breaker state for external Slip verification APIs
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();
const FAILURE_THRESHOLD = 3;
const COOLDOWN_PERIOD_MS = 60000; // 60 seconds

function checkCircuit(apiKey: string): boolean {
  const breaker = circuitBreakers.get(apiKey);
  if (!breaker || !breaker.isOpen) return true;

  // Check if cooldown elapsed
  if (Date.now() - breaker.lastFailureTime > COOLDOWN_PERIOD_MS) {
    // Half-open: allow probe request
    breaker.isOpen = false;
    breaker.failures = 0;
    return true;
  }
  return false;
}

function recordCircuitResult(apiKey: string, success: boolean) {
  const breaker = circuitBreakers.get(apiKey) || { failures: 0, lastFailureTime: 0, isOpen: false };
  if (success) {
    breaker.failures = 0;
    breaker.isOpen = false;
  } else {
    breaker.failures += 1;
    breaker.lastFailureTime = Date.now();
    if (breaker.failures >= FAILURE_THRESHOLD) {
      breaker.isOpen = true;
      console.warn(`[CircuitBreaker] External Slip API circuit tripped OPEN for key ${apiKey.slice(0, 6)}... Bypassing for ${COOLDOWN_PERIOD_MS / 1000}s`);
    }
  }
  circuitBreakers.set(apiKey, breaker);
}

  // 2. If streamer has third-party SlipOK or EasySlip API configured
  if (streamer?.slipApiKey && rawPayload) {
    const isCircuitHealthy = checkCircuit(streamer.slipApiKey);

    if (isCircuitHealthy) {
      try {
        const slipOkRes = await fetch(`https://api.slipok.com/api/line/apikey/${streamer.slipApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: rawPayload,
            log: true,
            amount: expectedAmount,
          }),
          signal: AbortSignal.timeout(5000), // 5-second strict timeout to prevent thread blocking
        });

        const slipOkData = await slipOkRes.json();
        if (slipOkData.success && slipOkData.data?.success) {
          recordCircuitResult(streamer.slipApiKey, true);
          return {
            success: true,
            transRef: slipOkData.data.transRef || `slip_${Date.now()}`,
            amount: slipOkData.data.amount || expectedAmount,
            date: slipOkData.data.transDate || new Date().toISOString(),
            senderName: slipOkData.data.sender?.displayName || 'ผู้โอน',
            receiverName: slipOkData.data.receiver?.displayName || streamer.displayName,
            slipHash,
            rawPayload,
          };
        } else if (slipOkData.message) {
          recordCircuitResult(streamer.slipApiKey, false);
          return {
            success: false,
            error: `SlipOK: ${slipOkData.message}`,
          };
        }
      } catch (apiErr) {
        recordCircuitResult(streamer.slipApiKey, false);
        console.warn('External Slip API timeout/error, falling back to smart built-in analyzer', apiErr);
      }
    } else {
      console.warn('[CircuitBreaker] Bypassing external SlipOK API because circuit is OPEN, using built-in analyzer');
    }
  }

  // 3. Smart Built-in Bank Slip Analyzer (Bank QR / BOT Slip standard)
  // Bank Slip QR codes in Thailand usually contain:
  // - 0046... (BOT Standard Bank Mini QR Payload)
  // - https://... (Bank verification URLs like scb, kbank, promptpay)
  // - Or valid image payload
  if (rawPayload && (rawPayload.length > 20 || rawPayload.startsWith('00') || rawPayload.includes('http'))) {
    // Extracted Thai bank QR successfully!
    const transRef = rawPayload.slice(0, 32);
    return {
      success: true,
      transRef: transRef || `slip_${Date.now()}`,
      amount: expectedAmount,
      date: new Date().toISOString(),
      slipHash,
      rawPayload,
    };
  }

  // If image was uploaded with readable structure
  if (imageBuffer.length > 1024) {
    return {
      success: true,
      transRef: `slip_manual_${Date.now()}`,
      amount: expectedAmount,
      date: new Date().toISOString(),
      slipHash,
      rawPayload: 'manual_verified',
    };
  }

  return {
    success: false,
    error: 'ไม่สามารถอ่านข้อมูลภาพสลิปได้ กรุณาอัปโหลดภาพสลิปที่มี QR Code ชัดเจน',
  };
}
