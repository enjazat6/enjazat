// حقل رفع ملف المنيو: صورة من المعرض أو ملف PDF، يُرفع مباشرة بعد اختياره.
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { uploadToCloudinary } from '../cloudinary';
import { colors, font, rtl } from '../theme';
import { AppText, Button } from './ui';

export function UploadField({ value, onChange, onError }) {
  const [busy, setBusy] = useState(false);

  const upload = async (asset) => {
    setBusy(true);
    onError(null);
    try {
      const url = await uploadToCloudinary(asset);
      onChange({ url, name: asset.name });
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    const a = result.assets?.[0];
    if (result.canceled || !a) return;
    await upload({
      uri: a.uri,
      name: a.fileName || 'menu.jpg',
      mimeType: a.mimeType || 'image/jpeg',
      size: a.fileSize,
      file: a.file,
    });
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    const a = result.assets?.[0];
    if (result.canceled || !a) return;
    await upload({
      uri: a.uri,
      name: a.name || 'menu.pdf',
      mimeType: a.mimeType || 'application/pdf',
      size: a.size,
      file: a.file,
    });
  };

  if (busy) {
    return (
      <View style={[styles.box, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.centerText}>جاري رفع الملف…</AppText>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {value ? (
        <View style={[styles.box, styles.done]}>
          <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          <View style={styles.flex}>
            <AppText style={styles.doneTitle}>تم رفع الملف</AppText>
            <AppText style={styles.fileName} numberOfLines={1}>
              {value.name}
            </AppText>
          </View>
        </View>
      ) : null}
      <Button
        title={value ? 'تغيير الصورة' : 'صورة المنيو من المعرض'}
        icon="image"
        variant={value ? 'outline' : 'primary'}
        onPress={pickImage}
      />
      <Button
        title={value ? 'تغيير ملف PDF' : 'ملف المنيو PDF'}
        icon="document"
        variant="outline"
        onPress={pickPdf}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  box: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
  },
  center: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  centerText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  done: {
    flexDirection: rtl.row,
    alignItems: 'center',
    gap: 12,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  doneTitle: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  fileName: {
    fontSize: font.small,
    color: colors.textMuted,
  },
});
