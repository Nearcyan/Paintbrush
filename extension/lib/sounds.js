// Paintbrush Sounds
// Simple melodic arpeggios for UI feedback

const PaintbrushSounds = {
  _ctx: null,
  _enabled: true,

  // Note frequencies
  _notes: {
    A3: 220.00,
    C4: 261.63,
    E4: 329.63,
    G4: 392.00,
    C5: 523.25,
  },

  /**
   * Get or create AudioContext (lazy init)
   */
  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  /**
   * Resume audio context (needed after user interaction)
   */
  async _resume() {
    const ctx = this._getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  },

  /**
   * Play a single note
   */
  _playNote(ctx, freq, startTime, duration = 0.2) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  },

  /**
   * Play arpeggio from array of frequencies
   */
  async _playArp(frequencies, interval = 0.07) {
    if (!this._enabled) return;
    const ctx = await this._resume();
    const now = ctx.currentTime;

    frequencies.forEach((freq, i) => {
      this._playNote(ctx, freq, now + (i * interval));
    });
  },

  /**
   * Start/Generating - Minor arpeggio up (A C E)
   */
  async playStart() {
    const { A3, C4, E4 } = this._notes;
    await this._playArp([A3, C4, E4]);
  },

  /**
   * Success/Done - Major arpeggio up (C E G)
   */
  async playSuccess() {
    const { C4, E4, G4 } = this._notes;
    await this._playArp([C4, E4, G4]);
  },

  /**
   * Apply/Select - Major arpeggio + octave (C E G C5)
   */
  async playApply() {
    const { C4, E4, G4, C5 } = this._notes;
    await this._playArp([C4, E4, G4, C5]);
  },

  /**
   * Cancel - Minor arpeggio down (E C A)
   */
  async playCancel() {
    const { A3, C4, E4 } = this._notes;
    await this._playArp([E4, C4, A3]);
  },

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled) {
    this._enabled = enabled;
  },

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this._enabled;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaintbrushSounds;
}
