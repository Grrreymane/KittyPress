// Promo video director (15 s, portrait). Pasted into the game's closure by _workflow/tools/record_video.py:
//   python ../_workflow/tools/record_video.py . tools/trailer.js --size 1080x1920 --out media/trailer.mp4
// Each shot sets up one thing to crush, fast-forwards silently to just before its best moment, then films it.
(async () => {
  let seed = 7; Math.random = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  save = () => {};   // never touch the real save
  cv.width = REC.width; cv.height = REC.height; K = cv.width / W;
  const cx = cv.getContext('2d'), dt = 1 / 30, LV = { 4: 0, 6: 1, 10: 2, 16: 3, 25: 4, 40: 5 };
  const clean = () => { PART.length = ACT.length = LENS.length = RINGS.length = POPS.length = 0; ram.goo = []; freeze = 0; };
  // a crush shot: fast-forward `ff` seconds with the press held, then film `len` seconds
  const crush = (kind, ff, len, cap) => ({ len, cap, setup() {
    clean(); up.ton = LV[NEED[kind]]; up.spd = 0; nextItem(kind); it.x = 90; phase = 'press'; ram.y = RAM_REST; ram.vy = 0; everHeld = true;
    hold = true; muted = true; for (let i = 0; i < ff * 30; i++) update(dt); muted = false;
  }, step() { hold = phase === 'press'; update(dt); render(); } });
  const SHOTS = [
    crush('can', .2, 2.4, ['只要按住', '压扁它！']),
    crush('ball', 3.7, 1.2, ['什么都能压', '']),
    crush('egg', 1.0, 1.1),
    crush('globe', 2.6, 1.1),
    crush('bubble', .3, 1.4),
    crush('hydrant', 2.9, 1.3),
    crush('rocket', 4.3, 1.4),
    { len: 2.6, cap: ['压扁的东西', '变成名画！'], setup() {   // the painting reveal with its auction price
      clean(); up.ton = 1; nextItem('melon'); it.x = 90; phase = 'press'; hold = true; muted = true;
      while (phase !== 'art') update(dt);
      for (let i = 0; i < 6; i++) update(dt); muted = false; hold = false;
    }, step() { hold = false; update(dt); render(); } },
    { len: 2.0, cap: ['100 样东西', '你能压多少？'], setup() {   // the collection page, filling in
      clean(); up.ton = 4; KINDS.forEach(k => delete seen[k]); openGallery(); gal.dex = true;
    }, step(i) { const n = Math.min(KINDS.length, 20 + i * 2); KINDS.slice(0, n).forEach(k => seen[k] = 1); render(); } },
  ];
  const total = SHOTS.reduce((a, s) => a + s.len, 0);
  let si = -1, sEnd = 0, capT = 0;
  // captions: small line first, the big punchline pops in 0.17 s later (overshoots to 1.15x, settles)
  const caption = (cap, t) => {
    if (!cap) return;
    const F = n => n + 'px ' + FONT, out = (s, x, y, px, col, sc) => {
      cx.save(); cx.translate(x, y); cx.scale(sc, sc); cx.font = F(px); cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = OUT; const u = px / 12; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) cx.fillText(s, dx * u * 1.2, dy * u * 1.2);
      cx.fillStyle = col; cx.fillText(s, 0, 0); cx.restore();
    };
    const y0 = cv.height * .155, Z = cv.width / 1080;
    if (cap[0]) out(cap[0], cv.width / 2, y0, 72 * Z, '#ffffff', 1);
    const tb = t - .17; if (cap[1] && tb > 0) { const k = Math.min(1, tb / .18); out(cap[1], cv.width / 2, y0 + 120 * Z, 132 * Z, '#ffe14a', k < 1 ? .6 + k * .55 : 1.15 - Math.min(.15, (tb - .18) * 1.5)); }
  };
  await REC.run({ fps: 30, seconds: total, canvas: cv, audio: true,
    setup(ac) {   // the game's sounds (and the press motor hum) render into the offline context
      AC = ac; initAudio = () => {};
      humO = ac.createOscillator(); humO.type = 'sawtooth'; humO.frequency.value = 55;
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
      humG = ac.createGain(); humG.gain.value = 0; humO.connect(f); f.connect(humG); humG.connect(ac.destination); humO.start();
    },
    step(i, t) {
      if (t >= sEnd - 1e-6 && si < SHOTS.length - 1) { si++; sEnd += SHOTS[si].len; capT = 0; SHOTS[si].setup(); }
      SHOTS[si].step(i);
      caption(SHOTS[si].cap, capT); capT += 1 / 30;
    },
  });
})();
