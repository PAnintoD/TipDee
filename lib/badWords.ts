/**
 * Bad Words & Profanity Filter for TipDee (Thai + English)
 * Filters offensive language, hate speech, and spam before TTS speech & widget display
 */

const THAI_BAD_WORDS = [
  'ควย', 'เหี้ย', 'เย็ด', 'สัส', 'ไอ้สัตว์', 'ไอ้เหี้ย', 'มึง', 'กู', 'อีเหี้ย', 'อีสัส',
  'ชาติชั่ว', 'หน้าด้าน', 'ระยำ', 'อีดอก', 'ดอกทอง', 'ห่า', 'บัดซบ', 'จังไร', 'กวนตีน',
  'สันดาน', 'ปัญญาอ่อน', 'ตอแหล', 'กระหรี่', 'สถุล', 'พ่อมึงตาย', 'แม่มึงตาย', 'เย็ดแม่',
  'เย็ดเข้', 'กวนส้นตีน', 'แม่ง', 'ส้นตีน', 'เหวย', 'โคตรพ่อ', 'โคตรแม่', 'หี', 'แตด',
  'หน้าหี', 'ดอ', 'ไอ้หน้าโง่', 'ส้นตีน', 'เสือก', 'ชิบหาย', 'เชี่ย', 'จิ๋ม', 'หำ',
];

const ENGLISH_BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'nigger', 'nigga',
  'faggot', 'retard', 'slut', 'whore', 'motherfucker', 'cock', 'piss', 'nazi', 'hitler',
];

const REPEATING_CHAR_REGEX = /(.)\1{4,}/g; // Detect spam like aaaaaaa or 555555555555555

/**
 * Filters profanity from text
 */
export function filterProfanity(text: string, mode: 'mask' | 'clean' = 'mask'): {
  cleanText: string;
  hasProfanity: boolean;
  censoredWords: string[];
} {
  if (!text || typeof text !== 'string') {
    return { cleanText: '', hasProfanity: false, censoredWords: [] };
  }

  let result = text;
  let hasProfanity = false;
  const censoredWords: string[] = [];

  // 1. Sanitize repeating characters spam (e.g. 55555555555555555 -> 5555)
  result = result.replace(REPEATING_CHAR_REGEX, '$1$1$1');

  // 2. Filter Thai words
  for (const word of THAI_BAD_WORDS) {
    const regex = new RegExp(word, 'gi');
    if (regex.test(result)) {
      hasProfanity = true;
      censoredWords.push(word);
      const replacement = mode === 'mask' ? '*'.repeat(word.length) : '';
      result = result.replace(regex, replacement);
    }
  }

  // 3. Filter English words with word boundary matching
  for (const word of ENGLISH_BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(result)) {
      hasProfanity = true;
      censoredWords.push(word);
      const replacement = mode === 'mask' ? '*'.repeat(word.length) : '';
      result = result.replace(regex, replacement);
    }
  }

  return {
    cleanText: result.trim(),
    hasProfanity,
    censoredWords,
  };
}

/**
 * Normalizes text for Thai TTS speech synthesizer
 */
export function normalizeTextForTTS(text: string): string {
  if (!text) return '';

  // Filter bad words first
  const { cleanText } = filterProfanity(text, 'mask');

  let normalized = cleanText;

  // Replace asterisks so TTS doesn't speak "ดอกจัน ดอกจัน"
  normalized = normalized.replace(/\*+/g, '...');

  // Normalize common symbols
  normalized = normalized.replace(/\+/g, 'บวก');
  normalized = normalized.replace(/&/g, 'และ');
  normalized = normalized.replace(/@/g, 'แอด');
  normalized = normalized.replace(/#/g, '');

  // Normalize laughing 555
  normalized = normalized.replace(/555+/g, 'ฮ่าฮ่าฮ่า');

  // Strip excessive whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Limit speech length for safety (max 250 characters)
  if (normalized.length > 250) {
    normalized = normalized.slice(0, 247) + '...';
  }

  return normalized;
}
