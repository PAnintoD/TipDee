/**
 * Input sanitization & XSS protection utilities for TipDee
 */

/**
 * Strips HTML tags, script tags, javascript: protocols, and control characters
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Strip HTML/XML tags
    .replace(/<[^>]*>?/gm, '')
    // Strip dangerous URL schemes
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Strip null bytes and non-printable control characters (except newline)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes donor name (max 50 chars, no newlines)
 */
export function sanitizeDonorName(name: string): string {
  if (!name) return 'ผู้ไม่ประสงค์ออกนาม';
  const clean = sanitizeInput(name, 50).replace(/[\r\n]+/g, ' ').trim();
  return clean || 'ผู้ไม่ประสงค์ออกนาม';
}

/**
 * Sanitizes donation message (max 200 chars)
 */
export function sanitizeMessage(message: string): string {
  if (!message) return '';
  return sanitizeInput(message, 200);
}
