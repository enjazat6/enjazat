// الحفظ والمشاركة على الجوال: التقاط صورة الباركود كما تظهر على الشاشة.
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const capture = (viewRef) => captureRef(viewRef, { format: 'png', quality: 1, result: 'tmpfile' });

// يعيد { ok, message } لعرضه للمستخدم
export async function saveQrImage({ viewRef }) {
  const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  if (!permission.granted) {
    return {
      ok: false,
      title: 'لا يوجد إذن',
      message: 'اسمح للتطبيق بالوصول إلى الصور من الإعدادات حتى تتمكن من حفظ الباركود.',
    };
  }
  const uri = await capture(viewRef);
  await MediaLibrary.saveToLibraryAsync(uri);
  return { ok: true, title: 'تم الحفظ', message: 'تم حفظ صورة الباركود في معرض الصور.' };
}

export async function shareQrImage({ viewRef }) {
  const uri = await capture(viewRef);
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    UTI: 'public.png',
    dialogTitle: 'مشاركة الباركود',
  });
}
