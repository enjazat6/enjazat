import { Ionicons } from '@expo/vector-icons';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button } from '../components/ui';
import { parseScanned } from '../scanParser';
import { colors, font, rtl } from '../theme';

const BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'datamatrix',
  'pdf417',
  'aztec',
];

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState(null);
  // يمنع قراءة نفس الباركود عدة مرات قبل تحديث الحالة
  const locked = useRef(false);

  const handleScan = ({ data }) => {
    if (locked.current || !data) return;
    locked.current = true;
    setResult({ raw: data, info: parseScanned(data) });
  };

  const scanAgain = () => {
    setResult(null);
    locked.current = false;
  };

  const scanFromImage = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    try {
      const found = await scanFromURLAsync(picked.assets[0].uri, ['qr']);
      if (found.length) {
        handleScan(found[0]);
      } else {
        Alert.alert('لم يُعثر على باركود', 'لم نجد باركود واضحاً في هذه الصورة.');
      }
    } catch {
      Alert.alert('تعذّرت القراءة', 'لم نتمكن من قراءة الصورة.');
    }
  };

  if (result) {
    return <ScanResult result={result} onScanAgain={scanAgain} />;
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera" size={64} color={colors.primary} />
        <AppText style={styles.centerText}>نحتاج إذن الكاميرا لقراءة الباركود</AppText>
        <Button
          title={permission.canAskAgain ? 'السماح باستخدام الكاميرا' : 'فتح الإعدادات'}
          icon="camera"
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
          style={styles.fullWidth}
        />
        <Button
          title="قراءة من صورة"
          icon="image"
          variant="outline"
          onPress={scanFromImage}
          style={styles.fullWidth}
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={styles.flex}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={handleScan}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <AppText style={styles.overlayText}>وجّه الكاميرا نحو الباركود</AppText>
      </View>
      <View style={styles.bottomBar}>
        <Button title="قراءة من صورة" icon="image" variant="outline" onPress={scanFromImage} />
      </View>
    </View>
  );
}

function ScanResult({ result, onScanAgain }) {
  const { info, raw } = result;
  const copyValue = info.copyValue ?? raw;

  const open = async () => {
    try {
      await Linking.openURL(info.action.url);
    } catch {
      Alert.alert('تعذّر الفتح', 'لا يوجد تطبيق مناسب لفتح هذا المحتوى على جهازك.');
    }
  };

  const copy = async () => {
    await Clipboard.setStringAsync(copyValue);
    Alert.alert('تم النسخ', 'تم نسخ المحتوى.');
  };

  return (
    <ScrollView contentContainerStyle={styles.resultContent}>
      <View style={styles.resultHeader}>
        <View style={styles.resultIcon}>
          <Ionicons name={info.icon} size={32} color={colors.primary} />
        </View>
        <AppText style={styles.resultTitle}>{info.title}</AppText>
      </View>

      <View style={styles.card}>
        {info.rows.map(([label, value], i) => (
          <View key={label} style={[styles.row, i > 0 && styles.rowBorder]}>
            <AppText style={styles.rowLabel}>{label}</AppText>
            <AppText style={styles.rowValue} selectable>
              {value}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        {info.action ? (
          <Button title={info.action.label} icon={info.action.icon} onPress={open} />
        ) : null}
        <Button
          title={info.copyLabel ?? 'نسخ المحتوى'}
          icon="copy"
          variant="outline"
          onPress={copy}
        />
        <Button title="مسح باركود آخر" icon="scan" variant="outline" onPress={onScanAgain} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  centerText: {
    textAlign: 'center',
    fontSize: font.heading - 2,
    fontWeight: '600',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: colors.white,
    borderRadius: 24,
  },
  overlayText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: font.body + 1,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  resultContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultHeader: {
    flexDirection: rtl.row,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    flex: 1,
    fontSize: font.title - 2,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  row: {
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: font.body + 1,
    fontWeight: '600',
  },
  buttons: {
    marginTop: 20,
    gap: 12,
  },
});
