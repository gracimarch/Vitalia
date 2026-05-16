'use client';

/**
 * VoiceService to manage Web Speech API text-to-speech features.
 * Provides a fluid and guided trainer experience.
 */

class VoiceServiceClass {
  synth: SpeechSynthesis | null = null;
  voice: SpeechSynthesisVoice | null = null;
  rate: number = 1.0;
  isMuted: boolean = false;
  onSpeakingStateChange: ((isSpeaking: boolean) => void) | null = null;
  private initialized = false;

  init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    this.synth = window.speechSynthesis;
    if (!this.synth) return;

    const loadVoices = () => {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      if (voices.length === 0) return;

      const microsoftMaleVoice = voices.find(v => 
        (v.name.includes('Microsoft') || v.name.includes('Edge')) && 
        v.lang.startsWith('es') && 
        /(Jorge|Raul|Pablo|Alvaro|Tomas|Diego|Gerardo|Antonio|Emilio|Dario|Federico|Dionisio|Alonso)/i.test(v.name)
      );

      this.voice = microsoftMaleVoice ||
                   voices.find(v => v.name.includes('Natural') && v.lang.startsWith('es')) ||
                   voices.find(v => v.name.includes('Online') && v.lang.startsWith('es')) ||
                   voices.find(v => v.name === 'Google español') ||
                   voices.find(v => v.name === 'Google español de Estados Unidos') ||
                   voices.find(v => v.name.includes('Google') && v.lang.startsWith('es')) ||
                   voices.find(v => v.name === 'Paulina') || 
                   voices.find(v => v.name === 'Monica') || 
                   voices.find(v => v.lang === 'es-MX') ||
                   voices.find(v => v.lang === 'es-ES') ||
                   voices.find(v => v.lang.startsWith('es')) || 
                   voices[0] || null;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    this.initialized = true;
  }

  speak(text: string, interrupt = true) {
    if (typeof window === 'undefined') return;
    if (!this.synth) this.init();
    if (!this.synth || this.isMuted) return;

    if (interrupt) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'es-ES';
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
    };

    utterance.onend = () => {
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && this.onSpeakingStateChange) {
         this.onSpeakingStateChange(false);
      }
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
       this.synth.cancel();
       if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }
  }

  pause() {
    if (this.synth) this.synth.pause();
  }

  resume() {
    if (this.synth) this.synth.resume();
  }
}

export const VoiceService = new VoiceServiceClass();
