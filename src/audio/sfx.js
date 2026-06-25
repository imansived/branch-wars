// ─── SOUND ENGINE — lightweight Web Audio synth, no external files needed ─────
// Routes through a shared master gain bus (keeps overlapping notes from
// clipping/distorting on phone speakers) and exposes an "unlock" helper —
// mobile Safari/Chrome can silently drop the very first sound unless the
// audio pipeline is warmed up inside an early user-gesture handler.

let _audioCtx = null;
let _masterGain = null;

function getAudioCtx(){
  if(typeof window === "undefined") return null;
  if(!_audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    _audioCtx = new AC();
    _masterGain = _audioCtx.createGain();
    _masterGain.gain.value = 0.85; // headroom so simultaneous notes (win fanfare, csUnlock chime) don't distort
    _masterGain.connect(_audioCtx.destination);
  }
  if(_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

function getMasterGain(){ getAudioCtx(); return _masterGain; }

/**
 * Call this once, inside an early user-gesture handler (tap/click/keydown),
 * to warm up the audio pipeline. Without this, mobile Safari/Chrome can
 * silently drop the very first sound a page tries to play.
 */
export function unlockAudio(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  if(ctx.state === "suspended") ctx.resume();
  try{
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  }catch(e){ /* no-op — some browsers don't need the silent-buffer trick */ }
}

function playTone(freq, duration, { type="sine", gain=0.16, delay=0, attack=0.005 } = {}){
  const ctx = getAudioCtx(); if(!ctx) return;
  const master = getMasterGain();
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g); g.connect(master);
  osc.start(t0); osc.stop(t0 + duration + 0.05);
}

function playSweep(freqStart, freqEnd, duration, { type="sine", gain=0.16, delay=0 } = {}){
  const ctx = getAudioCtx(); if(!ctx) return;
  const master = getMasterGain();
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t0);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g); g.connect(master);
  osc.start(t0); osc.stop(t0 + duration + 0.05);
}

export const SFX = {
  move(){ playTone(220, 0.06, { type:"sine", gain:0.05 }); },

  merge(tier){
    // soft, satisfying "pop" — downward sine sweep, pitch growth capped so
    // high-tier merges (CS, AI&DS) stay pleasant instead of turning shrill
    const base = 320 + Math.min(tier, 6) * 22;
    playSweep(base, base * 0.8, 0.13, { type:"sine", gain:0.11 });
  },

  click(){ playTone(340, 0.05, { type:"square", gain:0.05 }); },

  shuffle(){
    // a quick "riffle" — short staccato clicks at varying pitches, like tiles
    // being shuffled, instead of one harsh sawtooth sweep
    const freqs = [420, 360, 480, 340, 400];
    freqs.forEach((f, i) => playTone(f, 0.05, { type:"triangle", gain:0.09, delay: i*0.045 }));
  },

  eventGood(){
    playTone(660, 0.12, { gain:0.13 });
    playTone(880, 0.16, { gain:0.13, delay:0.1 });
  },

  eventBad(){
    // a low double "bonk" — soft thud rather than a buzzy sweep or brassy descent
    playTone(196, 0.13, { type:"sine", gain:0.14 });
    playTone(164, 0.2, { type:"sine", gain:0.15, delay:0.16 });
  },

  csUnlock(){
    playTone(523, 0.15, { gain:0.16 });
    playTone(659, 0.15, { gain:0.16, delay:0.13 });
    playTone(784, 0.3, { gain:0.18, delay:0.26 });
  },

  win(){
    [523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.25, { gain:0.17, delay: i*0.12 }));
  },

  gameOver(){
    // a soft, melancholic 3-note descent — no harsh sawtooth, clearly distinct from eventBad's low thud
    playTone(392, 0.22, { type:"triangle", gain:0.12 });
    playTone(330, 0.22, { type:"triangle", gain:0.12, delay:0.2 });
    playTone(262, 0.42, { type:"triangle", gain:0.13, delay:0.4 });
  },

  backlog(){
    playTone(440, 0.1, { gain:0.13 });
    playTone(660, 0.18, { gain:0.13, delay:0.1 });
  },
};
