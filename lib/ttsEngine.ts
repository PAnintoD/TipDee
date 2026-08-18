/**
 * Text-to-Speech Engine using Web Speech API with Thai / English voice matching
 */

export interface TTSOptions {
  voiceLang?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  volume?: number; // 0 - 100
}

export function speakText(text: string, options: TTSOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    if (!text || text.trim() === '') {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.speed || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume / 100 : 0.9;
    utterance.lang = options.voiceLang || 'th-TH';

    // Try finding the best Thai voice if available
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(
      (v) => v.lang.includes('th') || v.name.toLowerCase().includes('thai') || v.lang.toLowerCase().includes('th-th')
    );

    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn('TTS Speech error:', e);
      resolve();
    };

    // Safety timeout in case onend never fires
    const maxDuration = Math.max(3000, text.length * 200);
    const timeout = setTimeout(() => {
      resolve();
    }, maxDuration);

    utterance.onend = () => {
      clearTimeout(timeout);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}
