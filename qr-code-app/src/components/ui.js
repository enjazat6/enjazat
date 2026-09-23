import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { baseText, colors, font, rtl } from '../theme';

// Alert لا يعمل في نسخة الويب، فنستخدم نافذة المتصفح هناك
export function showMessage(title, message) {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
}

export function AppText({ style, ...props }) {
  return <Text {...props} style={[baseText, style]} />;
}

export function Header({ title, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="رجوع"
        >
          <Ionicons name={rtl.backIcon} size={28} color={colors.white} />
        </Pressable>
      ) : null}
      <AppText style={styles.headerTitle} numberOfLines={1}>
        {title}
      </AppText>
    </View>
  );
}

export function Button({ title, icon, onPress, variant = 'primary', disabled, style }) {
  const outline = variant === 'outline';
  const color = outline ? colors.primary : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        outline && styles.buttonOutline,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={24} color={color} /> : null}
      <AppText style={[styles.buttonText, { color }]}>{title}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: rtl.row,
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: font.heading,
    fontWeight: '700',
  },
  button: {
    flexDirection: rtl.row,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: font.body + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
