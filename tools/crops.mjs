// Нарізка кадрів із реального фото майстерні (assets/photo/original.png).
import sharp from '/opt/npm-tools/node_modules/sharp/dist/index.cjs';
const src = 'assets/photo/original.png';
const list = [
  ['hero', 0, 0, 1017, 539, 2034, 1078],
  ['service-fitting', 60, 330, 280, 209, 800, 600],
  ['service-balance', 330, 300, 300, 225, 800, 600],
  ['service-mount', 690, 330, 280, 209, 800, 600],
  ['service-repair', 150, 325, 280, 210, 800, 600],
  ['service-sale', 40, 170, 300, 225, 800, 600],
  ['service-select', 737, 230, 280, 210, 800, 600],
  ['gallery-1', 70, 280, 190, 259, 520, 709],
  ['gallery-2', 200, 110, 600, 300, 1200, 600],
  ['gallery-3', 30, 160, 220, 220, 660, 660],
  ['gallery-4', 165, 280, 520, 259, 1200, 598],
  ['gallery-5', 700, 300, 260, 239, 780, 717],
  ['gallery-6', 100, 180, 720, 155, 1440, 310],
  ['why', 60, 169, 370, 370, 800, 800],
  ['contact', 40, 120, 790, 330, 1580, 660],
];
for (const [n, l, t, w, h, ow, oh] of list) {
  await sharp(src).extract({ left: l, top: t, width: w, height: h })
    .resize(ow, oh, { kernel: 'lanczos3' }).modulate({ saturation: 1.08 }).sharpen({ sigma: 1.1 })
    .jpeg({ quality: 84, mozjpeg: true }).toFile(`assets/photo/${n}.jpg`);
}
// OG
const hero = await sharp(src).resize(1200, 630, { fit: 'cover', position: 'top' }).toBuffer();
const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#08090B" stop-opacity="0"/><stop offset="1" stop-color="#08090B" stop-opacity=".95"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><text x="60" y="560" fill="#fff" font-family="Arial" font-weight="800" font-size="56" letter-spacing="-1">Шиномонтаж в Одесі · Pascal Tire Studio</text><rect x="60" y="590" width="120" height="8" fill="#FFD400"/></svg>`);
await sharp(hero).composite([{ input: shade }]).png().toFile('assets/og.png');
console.log('done');
