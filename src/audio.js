/* ==========================================================================
   HYBRID AUDIO ENGINE: ANBIL AVAN BGM PLAYER & SYNTHESIZER
   ========================================================================== */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bgTimer = null;
    
    // HTML5 Audio Element for custom Anbil Avan MP3
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.src = '/anbil_avan_bgm.mp3'; // Target path
    this.hasMp3 = false;

    // Check if MP3 file exists or try secondary path
    this.checkMp3File();
  }

  checkMp3File() {
    this.audioElement.preload = 'auto';
    this.audioElement.loop = true;

    // Seamless auto-loop handler for all mobile and desktop browsers
    this.audioElement.addEventListener('ended', () => {
      if (this.isPlaying) {
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(err => console.warn("Auto-loop play error:", err));
      }
    });

    this.audioElement.addEventListener('canplaythrough', () => {
      this.hasMp3 = true;
    });
    this.audioElement.addEventListener('loadeddata', () => {
      this.hasMp3 = true;
    });
    this.audioElement.addEventListener('error', () => {
      if (this.audioElement.src.includes('anbil_avan_bgm')) {
        this.audioElement.src = '/wedding_music.mp3';
      } else {
        this.hasMp3 = false;
      }
    });
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* Plays tactile wax crack sound effect on seal tap */
  playWaxCrackSound() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Tactile bump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);

    // High paper noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  /* Plays a romantic synthesized note with piano/flute decay */
  playToneNote(freq, delay = 0, duration = 2.2, type = 'sine') {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  startAmbientMusic() {
    this.isPlaying = true;
    this.initContext();

    // Try playing MP3 audio file directly
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.hasMp3 = true;
      }).catch(err => {
        console.warn("MP3 playback prevented or failed, using fallback synthesizer:", err);
        this.startAnbilAvanSynthesizer();
      });
    } else {
      this.startAnbilAvanSynthesizer();
    }
  }

  /* Synthesizes the signature romantic 'Anbil Avan' melody line */
  startAnbilAvanSynthesizer() {
    this.initContext();

    // Notes corresponding to Anbil Avan melody in C Major:
    // E5 (659.25), G5 (783.99), C6 (1046.50), B5 (987.77), A5 (880.00), G5 (783.99), E5 (659.25), D5 (587.33)
    const melody = [
      { freq: 659.25, time: 0.0, dur: 1.8 }, // E5
      { freq: 783.99, time: 0.4, dur: 1.8 }, // G5
      { freq: 1046.5, time: 0.8, dur: 2.2 }, // C6
      { freq: 987.77, time: 1.4, dur: 2.0 }, // B5
      { freq: 880.00, time: 1.8, dur: 2.0 }, // A5
      { freq: 783.99, time: 2.2, dur: 2.5 }, // G5
      
      { freq: 659.25, time: 3.0, dur: 1.8 }, // E5
      { freq: 587.33, time: 3.4, dur: 1.8 }, // D5
      { freq: 659.25, time: 3.8, dur: 2.0 }, // E5
      { freq: 783.99, time: 4.2, dur: 2.0 }, // G5
      { freq: 880.00, time: 4.6, dur: 2.5 }, // A5
      { freq: 1046.5, time: 5.0, dur: 3.0 }  // C6
    ];

    const playSequence = () => {
      if (!this.isPlaying) return;

      melody.forEach(note => {
        this.playToneNote(note.freq, note.time, note.dur, 'sine');
        // Add soft lower octave bass note for warmth
        this.playToneNote(note.freq / 2, note.time, note.dur * 1.2, 'triangle');
      });

      this.bgTimer = setTimeout(playSequence, 6400);
    };

    playSequence();
  }

  stopAmbientMusic() {
    this.isPlaying = false;
    if (this.bgTimer) clearTimeout(this.bgTimer);
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }
}
