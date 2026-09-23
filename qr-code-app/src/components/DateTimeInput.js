// اختيار التاريخ والوقت على الجوال (أندرويد وآيفون)
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, inputBase, rtl } from '../theme';
import { AppText } from './ui';

const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function formatDateTime(date) {
  const h = date.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = h < 12 ? 'صباحاً' : 'مساءً';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} - ${hour12}:${minutes} ${period}`;
}

export function DateTimeInput({ value, onChange }) {
  const [iosOpen, setIosOpen] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      // أندرويد: نختار التاريخ أولاً ثم الوقت
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type !== 'set' || !date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            is24Hour: false,
            onChange: (e2, time) => {
              if (e2.type !== 'set' || !time) return;
              const result = new Date(date);
              result.setHours(time.getHours(), time.getMinutes(), 0, 0);
              onChange(result);
            },
          });
        },
      });
    } else {
      setIosOpen((o) => !o);
    }
  };

  return (
    <>
      <Pressable onPress={open} style={styles.button}>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        <AppText style={styles.text}>{formatDateTime(value)}</AppText>
      </Pressable>
      {Platform.OS === 'ios' && iosOpen ? (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={value}
            mode="datetime"
            display="spinner"
            locale="ar"
            onChange={(_, date) => date && onChange(date)}
          />
          <Pressable onPress={() => setIosOpen(false)} style={styles.doneButton}>
            <AppText style={styles.doneText}>تم</AppText>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    ...inputBase,
    flexDirection: rtl.row,
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
  },
  iosPicker: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneButton: {
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneText: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
