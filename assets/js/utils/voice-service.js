/**
 * VoiceService to manage Web Speech API text-to-speech features.
 * Provides a fluid and guided trainer experience.
 */
const VoiceService = {
  synth: window.speechSynthesis,
  voice: null,
  rate: 1.0, // Velocidad normal (1.0) para que suene más natural y menos robótico
  isMuted: false,

  // Callbacks for visual indicators
  onSpeakingStateChange: null,

  init() {
    if (!this.synth) return;
    
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if(voices.length === 0) return;
      
      // Priorizar la voz de hombre de Microsoft (Edge/Windows/Android)
      const microsoftMaleVoice = voices.find(v => 
        (v.name.includes('Microsoft') || v.name.includes('Edge')) && 
        v.lang.startsWith('es') && 
        /(Jorge|Raul|Pablo|Alvaro|Tomas|Diego|Gerardo|Antonio|Emilio|Dario|Federico|Dionisio|Alonso)/i.test(v.name)
      );

      // Select the most natural sounding Spanish voice available
      // TOP 1: Voz masculina de Microsoft (a petición)
      // TOP 2: Voces "Naturales" (Neuronales) de Microsoft Edge. Son gratuitas y de nivel humano.
      // TOP 3: Voz de Google (motor de Chrome/Android)
      // TOP 4: Voces nativas Premium de Mac (Paulina / Monica)
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
                   voices[0];
    };
    
    // Load immediately if voices are already loaded
    loadVoices();
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  },

  speak(text, interrupt = true) {
    if (!this.synth || this.isMuted) return;

    if (interrupt) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'es-ES'; // Set clear language request
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if(this.onSpeakingStateChange) this.onSpeakingStateChange(true);
    };

    utterance.onend = () => {
      if(this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    };

    utterance.onerror = (e) => {
      // It will throw an error if canceled, which is regular behavior
      if (e.error !== 'canceled' && this.onSpeakingStateChange) {
         this.onSpeakingStateChange(false);
      }
    };

    this.synth.speak(utterance);
  },

  stop() {
    if (this.synth) {
       this.synth.cancel();
       if(this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }
  },

  pause() {
    if (this.synth) this.synth.pause();
    // we do not fire onSpeakingStateChange(false) here so they know it's paused. Let visual indicator glow pause
  },

  resume() {
    if (this.synth) this.synth.resume();
  }
};

// Initialize immediately at module load
VoiceService.init();
