import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { baseText, colors, font, rtl } from '../theme';
import { AppText } from './ui';

const KEYBOARDS = {
  url: { keyboardType: 'url', autoCapitalize: 'none', autoCorrect: false },
  email: { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false },
  phone: { keyboardType: 'phone-pad' },
  decimal: { keyboardType: Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric' },
};

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

export function Field({ field, value, onChange }) {
  if (field.type === 'choice')
    return <ChoiceField field={field} value={value} onChange={onChange} />;
  if (field.type === 'datetime')
    return <DateTimeField field={field} value={value} onChange={onChange} />;
  return <TextField field={field} value={value} onChange={onChange} />;
}

function Label({ field }) {
  return (
    <AppText style={styles.label}>
      {field.label}
      {field.required ? <AppText style={styles.required}> *</AppText> : null}
    </AppText>
  );
}

function TextField({ field, value, onChange }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.field}>
      <Label field={field} />
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor="#98A39F"
          multiline={field.multiline}
          secureTextEntry={field.secure && hidden}
          autoCapitalize={field.secure ? 'none' : undefined}
          autoCorrect={field.secure ? false : undefined}
          {...KEYBOARDS[field.keyboard]}
          style={[
            styles.input,
            field.multiline && styles.multiline,
            field.secure && styles.secureInput,
          ]}
        />
        {field.secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.eye}
            accessibilityLabel={hidden ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور'}
          >
            <Ionicons name={hidden ? 'eye' : 'eye-off'} size={24} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ChoiceField({ field, value, onChange }) {
  return (
    <View style={styles.field}>
      <Label field={field} />
      <View style={styles.choices}>
        {field.options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.choice, selected && styles.choiceSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <AppText style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DateTimeField({ field, value, onChange }) {
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
    <View style={styles.field}>
      <Label field={field} />
      <Pressable onPress={open} style={[styles.input, styles.dateButton]}>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        <AppText style={styles.dateText}>{formatDateTime(value)}</AppText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: font.body,
    fontWeight: '700',
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  inputRow: {
    flexDirection: rtl.row,
    alignItems: 'center',
  },
  input: {
    ...baseText,
    flex: 1,
    minHeight: 54,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: font.body + 1,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  secureInput: {
    [rtl.paddingLeft]: 48,
  },
  eye: {
    position: 'absolute',
    [rtl.left]: 12,
  },
  choices: {
    flexDirection: rtl.row,
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    flexGrow: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  choiceText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: colors.primaryDark,
  },
  dateButton: {
    flexDirection: rtl.row,
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
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
