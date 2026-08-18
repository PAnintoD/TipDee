import QRCode from 'qrcode';

/**
 * Calculates CRC16-CCITT checksum for EMVCo standard QR code
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Helper to build Tag-Length-Value (TLV) string
 */
function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Normalizes Thai mobile phone number, Citizen ID, or e-Wallet ID into PromptPay format
 */
export function formatPromptPayTarget(target: string): { type: 'phone' | 'id' | 'ewallet'; formatted: string } {
  const cleaned = target.replace(/[^0-9]/g, '');
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Thai Mobile: 08x-xxx-xxxx -> 00668xxxxxxxx
    const international = '0066' + cleaned.substring(1);
    return { type: 'phone', formatted: international };
  } else if (cleaned.length === 13) {
    // Thai Citizen ID: 13 digits
    return { type: 'id', formatted: cleaned };
  } else if (cleaned.length === 15) {
    // E-Wallet ID: 15 digits
    return { type: 'ewallet', formatted: cleaned };
  }
  
  // Default to phone if close
  if (cleaned.length === 9) {
    return { type: 'phone', formatted: '0066' + cleaned };
  }
  
  return { type: 'phone', formatted: cleaned };
}

/**
 * Generates an EMVCo compliant Dynamic PromptPay QR Payload
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const { type, formatted } = formatPromptPayTarget(target);
  
  // Merchant Account Information (Tag 29)
  const aid = formatTLV('00', 'A000000677010111'); // PromptPay AID
  let accountSubTag = '';
  
  if (type === 'phone') {
    accountSubTag = formatTLV('01', formatted);
  } else if (type === 'id') {
    accountSubTag = formatTLV('02', formatted);
  } else {
    accountSubTag = formatTLV('03', formatted);
  }
  
  const merchantAccountInfo = formatTLV('29', aid + accountSubTag);
  
  // Payload Format Indicator (Tag 00)
  const pfi = formatTLV('00', '01');
  
  // Point of Initiation Method (Tag 01): 11 for static, 12 for dynamic (with amount)
  const pointOfInitiation = formatTLV('01', amount && amount > 0 ? '12' : '11');
  
  // Transaction Currency (Tag 53): 764 = THB
  const currency = formatTLV('53', '764');
  
  // Country Code (Tag 58): TH
  const country = formatTLV('58', 'TH');
  
  let rawPayload = pfi + pointOfInitiation + merchantAccountInfo + currency;
  
  // Transaction Amount (Tag 54) if specified
  if (amount !== undefined && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    rawPayload += formatTLV('54', formattedAmount);
  }
  
  rawPayload += country;
  
  // Append Tag 63 (CRC ID + Length) and calculate CRC16
  const payloadWithCRCHeader = rawPayload + '6304';
  const checksum = crc16(payloadWithCRCHeader);
  
  return payloadWithCRCHeader + checksum;
}

/**
 * Generates a QR Code as Base64 Data URL
 */
export async function generatePromptPayQRCode(target: string, amount?: number): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  return QRCode.toDataURL(payload, {
    margin: 2,
    width: 320,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}
