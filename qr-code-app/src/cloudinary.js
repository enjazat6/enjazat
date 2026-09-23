// رفع ملف (صورة أو PDF) إلى Cloudinary وإرجاع رابطه.
// الرفع يتم عبر "upload preset" غير موقّع، فلا يحتاج التطبيق أي مفتاح سري.
// الإعداد يُنشأ تلقائياً من GitHub عبر .github/workflows/qr-code-app-cloudinary-setup.yml
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

export const CLOUDINARY = {
  cloudName: 'y40obt0p',
  uploadPreset: 'qr_menu_unsigned',
  // حد الرفع في خطة Cloudinary المجانية (الصور تُصغَّر تلقائياً، فالحد يهم ملفات PDF فقط)
  maxBytes: 10 * 1024 * 1024,
};

// أطول ضلع للصورة بعد التصغير: واضح جداً على الجوال وحجمه عادة أقل من ٢ ميجابايت
const MAX_IMAGE_SIDE = 2560;

// تصغير الصورة وتحويلها إلى JPEG قبل الرفع، حتى تُقبل أي صورة مهما كان حجمها
async function prepareImage(asset) {
  const original = await ImageManipulator.manipulate(asset.uri).renderAsync();
  const longest = Math.max(original.width, original.height);
  const context = ImageManipulator.manipulate(asset.uri);
  if (longest > MAX_IMAGE_SIDE) {
    context.resize(
      original.width >= original.height ? { width: MAX_IMAGE_SIDE } : { height: MAX_IMAGE_SIDE },
    );
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return {
    uri: saved.uri,
    name: asset.name.replace(/\.[^.]+$/, '') + '.jpg',
    mimeType: 'image/jpeg',
  };
}

// asset: { uri, name, mimeType, size, file? }
export async function uploadToCloudinary(asset) {
  const isPdf = asset.mimeType === 'application/pdf';
  if (isPdf && asset.size && asset.size > CLOUDINARY.maxBytes) {
    throw new Error(
      'ملف PDF أكبر من ١٠ ميجابايت، وهو الحد الأقصى في Cloudinary المجاني. صغّر الملف أو ارفع المنيو كصورة.',
    );
  }
  if (!isPdf) {
    try {
      asset = await prepareImage(asset);
    } catch {
      throw new Error('تعذّر تجهيز الصورة. جرّب صورة أخرى.');
    }
  }

  const form = new FormData();
  if (Platform.OS === 'web') {
    // ملف PDF يُرفع كما هو، والصورة المصغّرة تُقرأ من رابطها
    const blob = (isPdf && asset.file) || (await (await fetch(asset.uri)).blob());
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
