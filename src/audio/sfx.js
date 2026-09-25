// ─── SOUND ENGINE — premium Web Audio synth, no external files needed ─────────
// Master bus → DynamicsCompressor → Gain → Destination
// Compressor prevents clipping when multiple sounds fire simultaneously
// (mobile speakers clip far earlier than desktop headphones).
// Short convolution reverb adds space without muddying on phone speakers.

let _audioCtx = null;
let _bus = null;
let _rev = null;

function getAudioCtx(){
  if(typeof window === "undefined") return null;
  if(!_audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    _audioCtx = new AC();
  }
  if(_audioCtx.state === "suspended") _audioCtx.resume().catch(()=>{});
  return _audioCtx;
}

function getBus(){
  const ctx = getAudioCtx(); if(!ctx) return null;
  if(!_bus || _bus.gain.context !== ctx){
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value      = 8;
    comp.ratio.value     = 4;
    comp.attack.value    = 0.004;
    comp.release.value   = 0.12;
    const g = ctx.createGain();
    g.gain.value = 0.72; // master volume — comfortable on phone speakers

    // Gentle top-end cut on the whole mix — the thing that makes synthesized
    // oscillators read as "cheap"/beepy is usually harsh upper harmonics, not
    // the notes themselves. Rounding those off is the single biggest lever
    // for a more premium-feeling palette, and it's free on every sound at once.
    const warmth = ctx.createBiquadFilter();
    warmth.type = "highshelf";
    warmth.frequency.value = 7500;
    warmth.gain.value = -5;

    comp.connect(g); g.connect(warmth); warmth.connect(ctx.destination);
    _bus = { input: comp, gain: g };
  }
  return _bus;
}

function getRev(){
  const ctx = getAudioCtx(); if(!ctx) return null;
  if(!_rev || _rev.context !== ctx){
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for(let ch = 0; ch < 2; ch++){
      const d = buf.getChannelData(ch);
      for(let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    const send = ctx.createGain();
    send.gain.value = 0.13;
    conv.connect(send);
    send.connect(getBus()?.input ?? ctx.destination);
    _rev = conv;
  }
  return _rev;
}

// ─── PRIMITIVE BUILDERS ────────────────────────────────────────────────────────

function tone({ freq=440, type="sine", t0, attack=0.006, decay=0.1,
                sustain=0.35, release=0.22, peak=0.5, rev=0.18, delay=0, warm=true }={}){
  const ctx = getAudioCtx(); if(!ctx) return;
  const bus = getBus(); if(!bus) return;
  const start = (t0 ?? ctx.currentTime) + delay;
  const end   = start + attack + decay + release;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(peak,           start + attack);
  env.gain.linearRampToValueAtTime(peak * sustain, start + attack + decay);
  env.gain.setValueAtTime(peak * sustain,          start + attack + decay);
  env.gain.exponentialRampToValueAtTime(0.0001,    end);

  // Rounds off upper harmonics so triangle/sawtooth voices sit smoother —
  // same idea as the master-bus warmth filter, applied per-note.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = Math.max(freq * 4.5, 1500);
  lp.Q.value = 0.3;
  env.connect(lp); lp.connect(bus.input);

  // Two slightly-detuned unison voices instead of one flat oscillator — the
  // classic "chorus" trick, reads as far less clinical/MIDI-ish than a
  // single bare tone. Gains are trimmed down so this adds width, not volume.
  const voices = warm ? [-5, 5] : [0];
  const voiceGain = voices.length > 1 ? 0.55 : 1;
  voices.forEach(cents => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if(cents) osc.detune.setValueAtTime(cents, start);
    if(voiceGain !== 1){
      const og = ctx.createGain();
      og.gain.value = voiceGain;
      osc.connect(og); og.connect(env);
    } else {
      osc.connect(env);
    }
    osc.start(start); osc.stop(end + 0.05);
  });

  // Quiet high overtone — a soft "bell/mallet" shimmer riding on top of the
  // fundamental instead of a bare single pitch.
  if(warm){
    const overtone = ctx.createOscillator();
    const og = ctx.createGain();
    og.gain.value = 0.08;
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(freq * 3, start);
    overtone.connect(og); og.connect(env);
    overtone.start(start); overtone.stop(end + 0.05);
  }

  if(rev > 0){
    const r = getRev();
    if(r){ const sg = ctx.createGain(); sg.gain.value = rev; env.connect(sg); sg.connect(r); }
  }
}

function glide({ f0=440, f1=220, type="sine", t0, attack=0.008,
                 release=0.28, peak=0.4, rev=0.2, delay=0 }={}){
  const ctx = getAudioCtx(); if(!ctx) return;
  const bus = getBus(); if(!bus) return;
  const start = (t0 ?? ctx.currentTime) + delay;
  const end   = start + attack + release;

  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 16), start + release);

  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(peak, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(env); env.connect(bus.input);
  if(rev > 0){
    const r = getRev();
    if(r){ const sg = ctx.createGain(); sg.gain.value = rev; env.connect(sg); sg.connect(r); }
  }
  osc.start(start); osc.stop(end + 0.05);
}

function noise({ t0, attack=0.004, release=0.06, peak=0.12,
                 hpFreq=1800, lpFreq=8000, delay=0 }={}){
  const ctx = getAudioCtx(); if(!ctx) return;
  const bus = getBus(); if(!bus) return;
  const start = (t0 ?? ctx.currentTime) + delay;
  const dur   = attack + release;

  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource(); src.buffer = buf;
  const hp  = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = hpFreq;
  const lp  = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = lpFreq;
  const env = ctx.createGain();

  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(peak,   start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  src.connect(hp); hp.connect(lp); lp.connect(env); env.connect(bus.input);
  src.start(start); src.stop(start + dur + 0.02);
}

// ─── unlockAudio ──────────────────────────────────────────────────────────────
// Call this once inside an early user-gesture handler (tap / click / keydown).
// Mobile Safari/Chrome silently drop the very first sound unless the audio
// pipeline is warmed up inside a user interaction — this handles that.
export function unlockAudio(){
  const ctx = getAudioCtx(); if(!ctx) return;
  if(ctx.state === "suspended") ctx.resume().catch(()=>{});
  try{
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  }catch(e){ /* no-op — some browsers don't need the silent-buffer trick */ }
}

// ─── SFX PALETTE ──────────────────────────────────────────────────────────────
export const SFX = {

  // Soft paper-slide tick — quiet enough to not fatigue on every swipe,
  // present enough that a move still has some tactile confirmation.
  move(){
    noise({ attack:0.002, release:0.045, peak:0.05, hpFreq:2600, lpFreq:9000 });
  },

  // Swiping into a wall (no tiles actually move) previously made zero sound —
  // silent on both success and failure feels broken on a touch device where
  // there's no other confirmation the tap registered. Deliberately duller and
  // drier than move() so it reads as "nothing happened", not as an action —
  // warm:false skips the chorus/overtone treatment on purpose here.
  blocked(){
    tone({ freq:180, type:"sine", peak:0.10, attack:0.002, decay:0.03, sustain:0.15, release:0.05, rev:0, warm:false });
  },

  // Deep thud/boom that grows satisfyingly with each tier.
  // Mech (1) = low 55Hz sub thud, felt more than heard.
  // CS (8) = full ~195Hz chest-hitting boom with harmonic weight.
  merge(tier=1){
    const t   = Math.min(tier, 8);
    const ctx = getAudioCtx(); if(!ctx) return;
    const t0  = ctx.currentTime;

    const subFreq = 55 * Math.pow(1.18, t - 1); // 55Hz → ~195Hz over 8 tiers

    // Sub layer — the thud body
    tone({ freq:subFreq, type:"triangle", t0,
           peak:0.50 + t * 0.04,
           attack:0.005, decay:0.18, sustain:0.20, release:0.35, rev:0.20 });

    // Mid punch — one octave up
    tone({ freq:subFreq * 2, type:"triangle", t0,
           peak:0.28 + t * 0.02,
           attack:0.004, decay:0.10, sustain:0.10, release:0.22, rev:0.15, delay:0.004 });

    // From tier 4 (E&TC) onwards, low sine undertone for extra weight
    if(t >= 4){
      tone({ freq:subFreq * 0.5, type:"sine", t0,
             peak:0.18 + (t - 4) * 0.03,
             attack:0.010, decay:0.22, sustain:0.15, release:0.40, rev:0.12, delay:0.008 });
    }
  },

  // Clean UI click
  click(){
    tone({ freq:880, type:"sine", peak:0.38,
           attack:0.002, decay:0.035, sustain:0.08, release:0.06, rev:0.05 });
  },

  // Faculty shuffle: explosive noise + descending glide + low undertone
  shuffle(){
    noise({ attack:0.003, release:0.18, peak:0.28, hpFreq:800, lpFreq:7000 });
    glide({ f0:620, f1:140, type:"sawtooth", peak:0.32,
            attack:0.010, release:0.36, rev:0.36, delay:0.025 });
    tone({ freq:80, type:"sine", peak:0.22,
           attack:0.020, decay:0.14, sustain:0.25, release:0.40, rev:0.20, delay:0.04 });
  },

  // Good event: ascending two-note chime
  eventGood(){
    tone({ freq:523, type:"sine", peak:0.46,
           attack:0.008, decay:0.09, sustain:0.40, release:0.32, rev:0.30 });
    tone({ freq:784, type:"sine", peak:0.38,
           attack:0.008, decay:0.09, sustain:0.32, release:0.32, rev:0.28, delay:0.14 });
  },

  // Bad event: descending minor-second — unsettling but gentle
  eventBad(){
    tone({ freq:370, type:"triangle", peak:0.44,
           attack:0.010, decay:0.14, sustain:0.30, release:0.40, rev:0.28 });
    tone({ freq:277, type:"triangle", peak:0.38,
           attack:0.012, decay:0.14, sustain:0.25, release:0.40, rev:0.26, delay:0.24 });
  },

  // CS tile first appears: rising major fanfare — root, 3rd, 5th, octave
  csUnlock(){
    const ctx = getAudioCtx(); if(!ctx) return;
    const t0  = ctx.currentTime;
    [1, 1.26, 1.498, 2].forEach((r, i) => {
      tone({ freq:392 * r, type:"sine", t0, peak:0.50,
             attack:0.010, decay:0.10, sustain:0.45, release:0.50,
             rev:0.45, delay:[0, 0.13, 0.26, 0.42][i] });
    });
    noise({ t0, attack:0.005, release:0.25, peak:0.10,
            hpFreq:4000, lpFreq:12000, delay:0.42 });
  },

  // Win: C-major chord bloom + resolution bell + shimmer
  win(){
    const ctx = getAudioCtx(); if(!ctx) return;
    const t0  = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => {
      tone({ freq:f, type:"sine", t0, peak:0.40,
             attack:0.010, decay:0.10, sustain:0.52, release:0.60,
             rev:0.46, delay:i * 0.018 });
    });
    tone({ freq:1046, type:"sine", t0, peak:0.44,
           attack:0.014, decay:0.10, sustain:0.48, release:0.70,
           rev:0.52, delay:0.42 });
    noise({ t0, attack:0.005, release:0.30, peak:0.08, hpFreq:5000, delay:0.40 });
  },

  // Game over: slow mechanical wind-down
  gameOver(){
    const ctx = getAudioCtx(); if(!ctx) return;
    const t0  = ctx.currentTime;
    glide({ f0:290, f1:58, type:"sawtooth", t0, peak:0.32,
            attack:0.022, release:0.82, rev:0.38 });
    tone({ freq:82, type:"sine", t0, peak:0.28,
           attack:0.030, decay:0.22, sustain:0.38, release:0.60,
           rev:0.24, delay:0.22 });
    noise({ t0, attack:0.010, release:0.55, peak:0.10,
            hpFreq:200, lpFreq:1800, delay:0.15 });
  },

  // Backlog clear: two rising relief tones
  backlog(){
    tone({ freq:440, type:"sine", peak:0.44,
           attack:0.006, decay:0.08, sustain:0.38, release:0.30, rev:0.26 });
    tone({ freq:660, type:"sine", peak:0.44,
           attack:0.006, decay:0.08, sustain:0.38, release:0.32,
           rev:0.28, delay:0.15 });
  },

};