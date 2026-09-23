import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../components/ui';
import { QR_TYPES } from '../qrTypes';
import { colors, font, rtl } from '../theme';

export default function HomeScreen({ onSelectType, onOpenScanner }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="qr-code" size={44} color={colors.white} />
        <AppText style={styles.appName}>مولّد الباركود</AppText>
        <AppText style={styles.subtitle}>اختر نوع الباركود الذي تريد إنشاءه</AppText>
      </View>

      <Pressable
        onPress={onOpenScanner}
        style={({ pressed }) => [styles.scanCard, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <View style={styles.scanIcon}>
          <Ionicons name="scan" size={30} color={colors.white} />
        </View>
        <View style={styles.flex}>
          <AppText style={styles.scanTitle}>قراءة باركود</AppText>
          <AppText style={styles.scanText}>امسح أي باركود بالكاميرا واعرف محتواه</AppText>
        </View>
        <Ionicons name={rtl.forwardIcon} size={24} color={colors.primary} />
      </Pressable>

      <AppText style={styles.sectionTitle}>إنشاء باركود جديد</AppText>

      <View style={styles.grid}>
        {QR_TYPES.map((type) => (
          <Pressable
            key={type.id}
            onPress={() => onSelectType(type)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={type.title}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={type.icon} size={30} color={colors.primary} />
            </View>
            <AppText style={styles.cardTitle}>{type.title}</AppText>
            <AppText style={styles.cardText} numberOfLines={2}>
              {type.description}
            </AppText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  flex: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  appName: {
    color: colors.white,
    fontSize: font.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#D6EFE8',
    textAlign: 'center',
  },
  scanCard: {
    flexDirection: rtl.row,
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 22,
  },
  scanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    fontSize: font.heading,
    fontWeight: '700',
  },
  scanText: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: font.heading,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: rtl.row,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48.5%',
    minHeight: 150,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: rtl.alignStart,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    alignSelf: 'stretch',
    fontSize: font.body + 1,
    fontWeight: '700',
  },
  cardText: {
    alignSelf: 'stretch',
    fontSize: font.small - 1,
    color: colors.textMuted,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
