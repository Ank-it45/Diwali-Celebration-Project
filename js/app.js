/* React UI (no build step: React is loaded from a CDN and uses createElement) */
const { useState, useEffect, useMemo } = React;
const h = React.createElement;

const SENDER = 'Ankit Chaudhary';
const WISH = [
  'May the light of countless diyas brighten every corner of your home and every heart in your family.',
  'May Maa Lakshmi bless you and your loved ones with health, happiness and prosperity, and may Lord Ganesha remove every obstacle from your path.',
  'Share sweets, laughter and love this Diwali, and may the year ahead glow as bright as tonight.'
];

function Stars() {
  const stars = useMemo(() => Array.from({ length: 90 }, () => ({
    left: Math.random() * 100, top: Math.random() * 70, size: Math.random() * 2.2 + 0.8,
    delay: Math.random() * 5, dur: 2 + Math.random() * 4
  })), []);
  return h('div', { className: 'stars', 'aria-hidden': true }, stars.map((s, i) =>
    h('i', { key: i, style: { left: s.left + '%', top: s.top + '%', width: s.size, height: s.size, animationDelay: s.delay + 's', animationDuration: s.dur + 's' } })));
}

function Lanterns() {
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    left: 5 + i * 11 + Math.random() * 5, delay: Math.random() * 12, dur: 16 + Math.random() * 12, scale: 0.6 + Math.random() * 0.7
  })), []);
  return h('div', { className: 'lanterns', 'aria-hidden': true }, items.map((l, i) =>
    h('span', { key: i, style: { left: l.left + '%', animationDelay: -l.delay + 's', animationDuration: l.dur + 's', '--s': l.scale } })));
}

function Diyas() {
  return h('div', { className: 'diyas', 'aria-hidden': true }, Array.from({ length: 11 }, (_, i) =>
    h('div', { key: i, className: 'diya' }, h('b', { className: 'flame', style: { animationDelay: (i * 0.23) + 's' } }), h('em', null))));
}

function WishCard({ onClose }) {
  return h('section', { className: 'wish', role: 'dialog', 'aria-label': 'Diwali wish' },
    h('div', { className: 'om', 'aria-hidden': true }, '🪔'),
    h('h2', { className: 'hindi' }, 'शुभ दीपावली'),
    h('h3', null, 'Happy Diwali to you and your family'),
    WISH.map((t, i) => h('p', { key: i, style: { animationDelay: 0.5 + i * 0.7 + 's' } }, t)),
    h('p', { className: 'from', style: { animationDelay: '3s' } }, 'With love and warm wishes,', h('strong', null, SENDER)),
    h('button', { className: 'ghost', onClick: onClose }, 'Close'));
}

function App() {
  const [shown, setShown] = useState(false);
  const [muted, setMuted] = useState(false);
  useEffect(() => { Crackers.mount(document.getElementById('fx')); }, []);

  const celebrate = () => { Sound.init(); Crackers.celebrate(); setShown(true); };
  const toggleSound = () => setMuted(Sound.toggle());

  return h('main', { className: 'stage' },
    h(Stars), h(Lanterns), h('div', { className: 'moon', 'aria-hidden': true }), h(Diyas),
    h('button', { className: 'mute', onClick: toggleSound, 'aria-label': muted ? 'Unmute' : 'Mute' }, muted ? '🔇' : '🔊'),
    shown
      ? h(WishCard, { onClose: () => setShown(false) })
      : h('div', { className: 'hero' },
          h('p', { className: 'hindi sub' }, 'दीपों का त्योहार'),
          h('h1', null, 'Deepavali'),
          h('p', { className: 'lead' }, 'Light a diya, send your wishes, and let the sky sparkle.')),
    h('button', { className: 'celebrate', onClick: celebrate }, shown ? 'Light more crackers' : 'Celebrate Diwali'));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
