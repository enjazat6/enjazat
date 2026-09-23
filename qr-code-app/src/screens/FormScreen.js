import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Field } from '../components/Fields';
import { AppText, Button } from '../components/ui';
import { buildPayload, initialValues, visibleFields } from '../qrTypes';
import { colors, font } from '../theme';

export default function FormScreen({ type, onGenerated }) {
  const [values, setValues] = useState(() => initialValues(type));
  const [error, setError] = useState(null);

  const generate = (current = values) => {
    const result = buildPayload(type, current);
    if (result.error) {
      setError(result.error);
      return;
    }
    onGenerated(result.data);
  };

  const setValue = (key, value) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setError(null);
    if (type.autoGenerate && value) generate(next);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText style={styles.hint}>{type.description}</AppText>

        {visibleFields(type, values).map((field) => (
          <Field
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => setValue(field.key, v)}
            onError={setError}
          />
        ))}

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : null}

        {type.autoGenerate && !values.file ? null : (
          <Button
            title="إنشاء الباركود"
            icon="qr-code"
            onPress={() => generate()}
            style={styles.button}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hint: {
    color: colors.textMuted,
    fontSize: font.small,
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  button: {
    marginTop: 6,
  },
});
