import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, font, inputBase, rtl } from '../theme';
import { DateTimeInput } from './DateTimeInput';
import { AppText } from './ui';

const KEYBOARDS = {
  url: { keyboardType: 'url', autoCapitalize: 'none', autoCorrect: false },
  email: { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false },
  phone: { keyboardType: 'phone-pad' },
  decimal: { keyboardType: Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric' },
};

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
  return (
    <View style={styles.field}>
      <Label field={field} />
      <DateTimeInput value={value} onChange={onChange} />
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
    ...inputBase,
    flex: 1,
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
});
