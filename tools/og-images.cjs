/**
 * Social share images (Open Graph / Twitter), 1200×630 → assets/img/og/
 *   npm run og
 * Each image is the page's cover, darkened at the bottom-left, with the name and the section.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/img/og');
const W = 1200;
const H = 630;
const img = (p) => path.join(ROOT, 'assets/img', p);

const IMAGES = [
  { name: 'og-home', src: 'home/hero2.jpg', sub: '3D Artist · Real-time & AI · Berlin' },
  { name: 'og-automotive', src: 'automotive/6.jpg', sub: 'Automotive', pos: 'right' },
  { name: 'og-archviz', src: 'archviz/render_001.jpg', sub: 'Archviz' },
  { name: 'og-vr-realtime', src: 'vr/showreel.jpg', sub: 'VR | Real-time · Unreal Engine' },
  { name: 'og-ai-generative', src: 'ai/yacht_main_night.jpg', sub: 'AI Generative' },
  { name: 'og-cv', src: 'award/muze.jpg', sub: 'Curriculum Vitae · Award winner 2026' },
  // projects: the four covers side by side, like the page
  {
    name: 'og-projects',
    strips: ['automotive/6.jpg', 'archviz/render_001.jpg', 'vr/yatch_game.jpg', 'ai/simul.jpg'],
    sub: 'Automotive · Archviz · VR · AI',
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const overlay = (sub) =>
  Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.35" stop-color="#080c0e" stop-opacity="0"/>
    <stop offset="1" stop-color="#080c0e" stop-opacity="0.82"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="64" y="${H - 104}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="84" letter-spacing="-4" fill="#fff">JUSCELIO DIAZ</text>
  <text x="68" y="${H - 58}" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="2" fill="#fff" fill-opacity="0.86">${esc(sub)}</text>
</svg>`);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const o of IMAGES) {
    let base;
    if (o.strips) {
      const sw = Math.ceil(W / o.strips.length);
      const parts = await Promise.all(
        o.strips.map((s) => sharp(img(s)).resize(sw, H, { fit: 'cover', position: 'centre' }).toBuffer()),
      );
      base = sharp({ create: { width: W, height: H, channels: 3, background: '#101719' } }).composite(
        parts.map((input, i) => ({ input, left: i * sw + i * 0, top: 0 })),
      );
      base = sharp(await base.jpeg().toBuffer());
    } else {
      base = sharp(img(o.src)).resize(W, H, { fit: 'cover', position: o.pos || 'centre' });
    }
    await base
      .composite([{ input: overlay(o.sub) }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT, o.name + '.jpg'));
    console.log(o.name);
  }
})();
