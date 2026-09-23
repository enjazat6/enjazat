// الحفظ والمشاركة في نسخة الويب: نرسم الباركود مباشرة على canvas بدقة عالية
// (أوضح من التقاط الشاشة)، ثم ننزّله كملف PNG أو نشاركه عبر المتصفح.
import QRCode from 'qrcode';

const SIZE = 1024;
const MARGIN = 48;
const FILE_NAME = 'barcode.png';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function renderPng({ data, color, logo }) {
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, data, {
    width: SIZE,
    margin: 0,
    errorCorrectionLevel: logo ? 'H' : 'M',
    color: { dark: color, light: '#FFFFFF' },
  });

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE + MARGIN * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qrCanvas, MARGIN, MARGIN, SIZE, SIZE);

  if (logo?.uri) {
    const img = await loadImage(logo.uri);
    // نفس نسب الشعار في الشاشة: 22% من الباركود مع خلفية بيضاء
    const logoSize = SIZE * 0.22;
    const pad = 16;
    const x = MARGIN + (SIZE - logoSize) / 2;
    const y = MARGIN + (SIZE - logoSize) / 2;
    ctx.fillStyle = '#FFFFFF';
    roundedRect(ctx, x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 24);
    ctx.fill();
    ctx.save();
    roundedRect(ctx, x, y, logoSize, logoSize, 20);
    ctx.clip();
    ctx.drawImage(img, x, y, logoSize, logoSize);
    ctx.restore();
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function saveQrImage(options) {
  download(await renderPng(options));
  return { ok: true, title: 'تم التنزيل', message: 'تم تنزيل صورة الباركود على جهازك.' };
}

export async function shareQrImage(options) {
  const blob = await renderPng(options);
  const file = new File([blob], FILE_NAME, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'باركود' });
    } catch (e) {
      // إغلاق قائمة المشاركة ليس خطأ
      if (e?.name !== 'AbortError') throw e;
    }
    return;
  }
  // المتصفح لا يدعم مشاركة الملفات: ننزّل الصورة بدلاً من ذلك
  download(blob);
}
