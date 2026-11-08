/* Canvas cracker engine: rockets, fuljhadi, chakri, anar, bombs */
const Crackers = (() => {
  let cv, c, W, H, dpr, parts = [], items = [], raf = 0, shake = 0, flash = 0, timers = [];
  const R = (a, b) => a + Math.random() * (b - a);
  const PICK = a => a[Math.floor(Math.random() * a.length)];
  const COLORS = ['#ffb627', '#ff5a36', '#ff3d8b', '#7df9ff', '#b4ff5c', '#c77dff', '#fff2b0'];

  const resize = () => {
  dpr = window.devicePixelRatio || 1;
  const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
  cv.width = W * dpr; cv.height = H * dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
};
  const spark = (x, y, vx, vy, color, life, size, g = 0.06, drag = 0.985) =>
    parts.push({ x, y, vx, vy, color, life, max: life, size, g, drag });
  const burst = (x, y, n, color, speed = 6) => {
    for (let i = 0; i < n; i++) {
      const a = R(0, 6.283), s = speed * Math.sqrt(Math.random());
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, color || PICK(COLORS), R(45, 90), R(1.2, 2.6));
    }
  };

  const rocket = (x = R(W * .15, W * .85)) => {
    Sound.launch();
    items.push({ t: 'rocket', x, y: H, vx: R(-.8, .8), vy: -R(11, 15), top: R(H * .12, H * .45), color: PICK(COLORS) });
  };
  const bomb = (x = R(W * .2, W * .8)) => { items.push({ t: 'bomb', x, y: H - 46, age: 0, fuse: 50 }); };
  const anar = (x = R(W * .1, W * .9)) => { Sound.crackle(3.5); items.push({ t: 'anar', x, y: H - 30, age: 0, life: 210 }); };
  const chakri = (x = R(W * .15, W * .85)) => { Sound.whirr(3); items.push({ t: 'chakri', x, y: H - 40, age: 0, life: 190, a: 0, drift: R(-.5, .5) }); };
  const fuljhadi = (x = R(W * .1, W * .9)) => { Sound.crackle(4); items.push({ t: 'ful', x, y: H - 34, age: 0, life: 240 }); };

  const step = it => {
    it.age = (it.age || 0) + 1;
    switch (it.t) {
      case 'rocket':
        it.x += it.vx; it.y += it.vy; it.vy += 0.08;
        spark(it.x, it.y, R(-.3, .3), R(.5, 1.5), '#ffd27a', 30, R(1, 2), 0.02);
        if (it.y <= it.top || it.vy > -2) {
          Sound.boom(.7); burst(it.x, it.y, 130, null, 7); burst(it.x, it.y, 50, it.color, 3.5);
          flash = .25; return false;
        }
        break;
      case 'bomb':
        if (it.age < it.fuse) {
          spark(it.x + 8, it.y - 22, R(-1, 1), R(-2, -.5), '#ffe08a', 14, 2, .05);
        } else {
          Sound.boom(1.3); burst(it.x, it.y, 160, null, 9);
          items.push({ t: 'ring', x: it.x, y: it.y, r: 10, a: 1 });
          shake = 14; flash = .55; return false;
        }
        break;
      case 'ring': it.r += 14; it.a -= 0.04; return it.a > 0;
      case 'anar':
        for (let i = 0; i < 7; i++)
          spark(it.x, it.y, R(-1.8, 1.8), -R(6, 13), PICK(['#ffb627', '#ffe08a', '#ff7a2f', '#fff']), R(40, 70), R(1.2, 2.2), 0.16);
        return it.age < it.life;
      case 'chakri': {
        it.a += 0.34; it.x += it.drift; it.y -= Math.sin(it.age / 30) * .6;
        for (let k = 0; k < 2; k++) {
          const a = it.a + k * Math.PI, s = 5;
          spark(it.x + Math.cos(a) * 16, it.y + Math.sin(a) * 16, Math.cos(a + 1.57) * s, Math.sin(a + 1.57) * s,
            PICK(['#ffb627', '#ff5a36', '#fff2b0']), R(25, 45), R(1.2, 2.2), 0.04);
        }
        return it.age < it.life;
      }
      case 'ful':
        for (let i = 0; i < 6; i++) {
          const a = R(0, 6.283), s = R(1, 4.5);
          spark(it.x, it.y - 70, Math.cos(a) * s, Math.sin(a) * s, PICK(['#fff', '#ffe08a', '#ffb627']), R(12, 28), R(.8, 1.8), 0.12);
        }
        return it.age < it.life;
    }
    return true;
  };

  const drawItem = it => {
    c.save();
    if (it.t === 'rocket') { c.fillStyle = '#ff5a36'; c.translate(it.x, it.y); c.rotate(Math.atan2(it.vy, it.vx) + 1.57); c.fillRect(-3, -2, 6, 16); c.fillStyle = '#ffd27a'; c.fillRect(-1, 14, 2, 6); }
    if (it.t === 'bomb') {
      c.translate(it.x, it.y); c.fillStyle = '#d62828'; c.fillRect(-9, -22, 18, 26);
      c.fillStyle = '#ffb627'; c.fillRect(-9, -14, 18, 4); c.strokeStyle = '#ddd'; c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(6, -30, 8, -22); c.stroke();
    }
    if (it.t === 'ring') { c.strokeStyle = `rgba(255,220,150,${it.a})`; c.lineWidth = 4; c.beginPath(); c.arc(it.x, it.y, it.r, 0, 6.283); c.stroke(); }
    if (it.t === 'anar') {
      c.translate(it.x, it.y); c.fillStyle = '#b5532a'; c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.lineTo(11, -26); c.lineTo(-11, -26); c.fill();
      c.fillStyle = '#ffb627'; c.fillRect(-14, -14, 28, 4);
    }
    if (it.t === 'chakri') {
      c.translate(it.x, it.y); c.rotate(it.a); c.strokeStyle = '#ffd27a'; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, 14, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.stroke();
    }
    if (it.t === 'ful') {
      c.translate(it.x, it.y); c.strokeStyle = '#8a8f98'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -70); c.stroke();
      c.fillStyle = '#fff'; c.shadowColor = '#ffb627'; c.shadowBlur = 18; c.beginPath(); c.arc(0, -70, 4, 0, 6.283); c.fill();
    }
    c.restore();
  };

  const frame = () => {
    c.save();
    c.clearRect(0, 0, W, H);
    if (shake > 0) { c.translate(R(-shake, shake), R(-shake, shake)); shake *= 0.9; }
    if (flash > 0.01) { c.fillStyle = `rgba(255,230,180,${flash})`; c.fillRect(0, 0, W, H); flash *= 0.85; }
    items = items.filter(it => step(it) !== false);
    items.forEach(drawItem);
    c.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => {
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.life--;
      if (p.life <= 0) return false;
      c.globalAlpha = p.life / p.max; c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, 6.283); c.fill();
      return true;
    });
    c.restore();
    raf = requestAnimationFrame(frame);
  };

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  const celebrate = () => {
    timers.forEach(clearTimeout); timers = [];
    at(0, () => bomb(W * .5)); at(900, () => { Sound.chime(); rocket(W * .3); rocket(W * .7); });
    at(1500, () => { anar(W * .2); anar(W * .8); fuljhadi(W * .35); fuljhadi(W * .65); });
    at(2400, () => { chakri(W * .3); chakri(W * .7); bomb(W * .15); bomb(W * .85); });
    for (let i = 0; i < 14; i++) at(3200 + i * 650, () => rocket());
    for (let i = 0; i < 4; i++) at(3600 + i * 2400, () => { bomb(); anar(); });
    at(5000, () => fuljhadi()); at(7000, () => chakri()); at(9500, () => { fuljhadi(); chakri(); });
    at(12500, () => { rocket(W * .25); rocket(W * .5); rocket(W * .75); bomb(W * .5); });
  };

  return {
    mount(canvas) { cv = canvas; c = cv.getContext('2d'); resize(); addEventListener('resize', resize); if (!raf) frame(); },
    celebrate, rocket, bomb, anar, chakri, fuljhadi,
    stats: () => ({ parts: parts.length, items: items.length })
  };
})();
