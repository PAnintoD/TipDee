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
  if (typeof window === 'undefined') {
    return;
  }

  const text = normalizeTextForTTS(rawText);
  if (!text || text.trim() === '') {
    return;
  }

  // 1. First priority: Natural Thai TTS Audio endpoint (Guaranteed to work in OBS Studio & browsers without Windows Thai voice pack)
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}`;
    const audio = new Audio(audioUrl);
    audio.volume = Math.max(0, Math.min(1, (options.volume !== undefined ? options.volume : 90) / 100));
    if (options.speed && options.speed !== 1.0) {
      audio.playbackRate = Math.max(0.5, Math.min(2.0, options.speed));
    }

    const played = await new Promise<boolean>((resolve) => {
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);

      // Timeout safety
      const timer = setTimeout(() => resolve(true), Math.max(4000, text.length * 250));

      audio
        .play()
        .then(() => {
          // Audio started playing successfully
        })
        .catch((err) => {
          console.warn('[TTS] Audio element play failed, falling back to Web Speech:', err);
          clearTimeout(timer);
          resolve(false);
        });
    });

    if (played) {
      return;
    }
  } catch (err) {
    console.warn('[TTS] Audio endpoint error, trying Web Speech API:', err);
  }

  // 2. Fallback to Web Speech API (speechSynthesis)
  return fallbackSpeechSynthesis(text, options);
}

function fallbackSpeechSynthesis(text: string, options: TTSOptions): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }

  return new Promise(async (resolve) => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.5, Math.min(2.0, options.speed || 1.0));
      utterance.pitch = Math.max(0.5, Math.min(2.0, options.pitch || 1.0));
      utterance.volume = Math.max(0, Math.min(1, (options.volume !== undefined ? options.volume : 90) / 100));
      utterance.lang = options.voiceLang || 'th-TH';

      const voices = await getAvailableVoices();
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
        console.warn('SpeechSynthesis error:', err);
        finish();
      };

      const maxTime = Math.max(3500, text.length * 250);
      setTimeout(finish, maxTime);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('SpeechSynthesis error:', err);
      resolve();
    }
  });
}
