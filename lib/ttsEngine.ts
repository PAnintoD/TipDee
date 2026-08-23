/**
 * Text-to-Speech Engine for TipDee
 * Features:
 * - Web Speech API with automatic Thai voice detection
 * - Profanity and abusive language filtering
 * - Speech text normalization (555 -> ฮ่าฮ่า, symbols, length limits)
 * - Safe audio unlock for OBS Browser Sources
 */

import { normalizeTextForTTS } from './badWords';

export interface TTSOptions {
  voiceLang?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  volume?: number; // 0 - 100
}

/**
 * Ensures voices are loaded in Chrome / OBS browser source
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };

    // Fallback timeout after 1s
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

/**
 * Speaks text using normalized speech synthesis
 */
export async function speakText(rawText: string, options: TTSOptions = {}): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const text = normalizeTextForTTS(rawText);
  if (!text || text.trim() === '') {
    return;
  }

  return new Promise(async (resolve) => {
    try {
      // Cancel any current utterance
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.5, Math.min(2.0, options.speed || 1.0));
      utterance.pitch = Math.max(0.5, Math.min(2.0, options.pitch || 1.0));
      utterance.volume = Math.max(0, Math.min(1, (options.volume !== undefined ? options.volume : 90) / 100));
      utterance.lang = options.voiceLang || 'th-TH';

      const voices = await getAvailableVoices();

      // Find best Thai voice (or fallback to user preferred)
      const thaiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('th') ||
          v.lang.toLowerCase().includes('th-th') ||
          v.name.toLowerCase().includes('thai') ||
          v.name.toLowerCase().includes('kanya') ||
          v.name.toLowerCase().includes('narisa') ||
          v.name.toLowerCase().includes('prew')
      );

      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      let isFinished = false;
      const finish = () => {
        if (!isFinished) {
          isFinished = true;
          resolve();
        }
      };

      utterance.onend = finish;
      utterance.onerror = (err) => {
        console.warn('TTS error', err);
        finish();
      };

      // Safety timeout in case onend never fires (common in older Chrome / OBS CEF)
      const maxTime = Math.max(3500, text.length * 250);
      setTimeout(finish, maxTime);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS speakText execution error', err);
      resolve();
    }
  });
}
