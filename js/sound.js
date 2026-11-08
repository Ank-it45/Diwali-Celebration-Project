/* Synthesised cracker sounds (Web Audio API) - no audio files needed */
const Sound = (() => {
  let ctx, master, muted = false;
  const init = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  const ok = () => ctx && !muted;
  const noise = (dur, type, f0, f1, vol, delay = 0) => {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type;
    const t = ctx.currentTime + delay;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  };
  const tone = (f0, f1, dur, vol, type = 'sine', delay = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur);
  };
  return {
    init,
    toggle() { muted = !muted; return muted; },
    isMuted: () => muted,
    launch() { if (ok()) tone(300, 1500, 0.7, 0.08, 'sawtooth'); },
    boom(v = 1) { if (ok()) { noise(1.4, 'lowpass', 1200, 60, 1.1 * v); tone(140, 35, 0.6, 0.9 * v); } },
    pop(v = 1) { if (ok()) { noise(0.5, 'bandpass', 3000, 400, 0.6 * v); tone(220, 60, 0.25, 0.4 * v); } },
    crackle(sec = 2) {
      if (!ok()) return;
      noise(sec, 'highpass', 5000, 4000, 0.12);
      for (let i = 0; i < sec * 12; i++) noise(0.03, 'highpass', 2500, 2000, 0.25, Math.random() * sec);
    },
    whirr(sec = 3) { if (ok()) { tone(120, 500, sec, 0.05, 'sawtooth'); noise(sec, 'bandpass', 2500, 5000, 0.08); } },
    chime() { if (ok()) [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 1.2, 0.12, 'sine', i * 0.12)); }
  };
})();
