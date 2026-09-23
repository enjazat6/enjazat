import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../components/ui';
import { QR_TYPES } from '../qrTypes';
import { colors, font, rtl } from '../theme';

export default function HomeScreen({ onSelectType }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="qr-code" size={44} color={colors.white} />
        <AppText style={styles.appName}>مولّد الباركود</AppText>
        <AppText style={styles.subtitle}>اختر نوع الباركود الذي تريد إنشاءه</AppText>
      </View>

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
