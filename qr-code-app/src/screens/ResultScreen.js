import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

import { AppText, Button } from '../components/ui';
import { colors, font, qrColors, rtl } from '../theme';

export default function ResultScreen({ data }) {
  const { width } = useWindowDimensions();
  const qrSize = Math.min(width - 96, 320);
  const shotRef = useRef(null);
  const [color, setColor] = useState(qrColors[0].value);
  const [logo, setLogo] = useState(null);
  const [busy, setBusy] = useState(false);

  // التقاط صورة PNG عالية الدقة للباركود (مع الهامش الأبيض)
  const capture = () => captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' });

  const save = async () => {
    setBusy(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
      if (!permission.granted) {
        Alert.alert(
          'لا يوجد إذن',
          'اسمح للتطبيق بالوصول إلى الصور من الإعدادات حتى تتمكن من حفظ الباركود.',
        );
        return;
      }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('تم الحفظ', 'تم حفظ صورة الباركود في معرض الصور.');
    } catch {
      Alert.alert('تعذّر الحفظ', 'لم نتمكن من حفظ الصورة. جرّب زر المشاركة ثم اختر "حفظ الصورة".');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const uri = await capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: 'مشاركة الباركود',
      });
    } catch {
      Alert.alert('تعذّرت المشاركة', 'حدث خطأ أثناء تجهيز الصورة للمشاركة.');
    } finally {
      setBusy(false);
    }
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setLogo({ uri: result.assets[0].uri });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.qrCard}>
        <View ref={shotRef} collapsable={false} style={styles.shot}>
          <QRCode
            value={data}
            size={qrSize}
            color={color}
            backgroundColor="#FFFFFF"
            // مستوى تصحيح أخطاء عالٍ عند وجود شعار حتى يبقى الباركود مقروءاً
            ecl={logo ? 'H' : 'M'}
            logo={logo ?? undefined}
            logoSize={qrSize * 0.22}
            logoBackgroundColor="#FFFFFF"
            logoMargin={4}
            logoBorderRadius={8}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="حفظ الصورة"
          icon="download"
          onPress={save}
          disabled={busy}
          style={styles.flex}
        />
        <Button
          title="مشاركة"
          icon="share-social"
          onPress={share}
          disabled={busy}
          style={styles.flex}
        />
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>لون الباركود</AppText>
        <View style={styles.colors}>
          {qrColors.map((c) => {
            const selected = c.value === color;
            return (
              <Pressable
                key={c.value}
                onPress={() => setColor(c.value)}
                style={[
                  styles.swatch,
                  { backgroundColor: c.value },
                  selected && styles.swatchSelected,
                ]}
                accessibilityRole="radio"
                accessibilityLabel={c.name}
                accessibilityState={{ selected }}
              >
                {selected ? <Ionicons name="checkmark" size={24} color="#FFFFFF" /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>شعار في المنتصف (اختياري)</AppText>
        {logo ? (
          <View style={styles.actions}>
            <Button
              title="تغيير الشعار"
              icon="image"
              variant="outline"
              onPress={pickLogo}
              style={styles.flex}
            />
            <Button
              title="إزالة"
              icon="trash"
              variant="outline"
              onPress={() => setLogo(null)}
              style={styles.flex}
            />
          </View>
        ) : (
          <Button title="إضافة شعار من الصور" icon="image" variant="outline" onPress={pickLogo} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  flex: {
    flex: 1,
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shot: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  actions: {
    flexDirection: rtl.row,
    gap: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: font.body + 1,
    fontWeight: '700',
    marginBottom: 12,
  },
  colors: {
    flexDirection: rtl.row,
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#B7C4BF',
    transform: [{ scale: 1.1 }],
  },
});
