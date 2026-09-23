// رفع ملف (صورة أو PDF) إلى Cloudinary وإرجاع رابطه.
// الرفع يتم عبر "upload preset" غير موقّع، فلا يحتاج التطبيق أي مفتاح سري.
// الإعداد يُنشأ تلقائياً من GitHub عبر .github/workflows/qr-code-app-cloudinary-setup.yml
import { Platform } from 'react-native';

export const CLOUDINARY = {
  cloudName: 'y40obt0p',
  uploadPreset: 'qr_menu_unsigned',
  // حد الرفع في خطة Cloudinary المجانية
  maxBytes: 10 * 1024 * 1024,
};

// asset: { uri, name, mimeType, size, file? }
export async function uploadToCloudinary(asset) {
  if (asset.size && asset.size > CLOUDINARY.maxBytes) {
    throw new Error('الملف أكبر من ١٠ ميجابايت، اختر ملفاً أصغر.');
  }

  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
    form.append('file', blob, asset.name);
  } else {
    form.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType });
  }
  form.append('upload_preset', CLOUDINARY.uploadPreset);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new Error('تعذّر الاتصال بالإنترنت. تأكد من الاتصال وحاول مرة أخرى.');
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.secure_url) {
    throw new Error('تعذّر رفع الملف. حاول مرة أخرى بعد قليل.');
  }
  return json.secure_url;
}
