// اختيار التاريخ والوقت في نسخة الويب: حقل المتصفح المدمج
import { createElement } from 'react';

import { colors, font } from '../theme';

const pad = (n) => String(n).padStart(2, '0');

// قيمة حقل datetime-local بالتوقيت المحلي: 2026-09-23T14:00
function toInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

const style = {
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 54,
  padding: '12px 14px',
  fontSize: font.body + 1,
  fontFamily: 'inherit',
  color: colors.text,
  backgroundColor: colors.white,
  border: `1.5px solid ${colors.border}`,
  borderRadius: 12,
  direction: 'rtl',
};

export function DateTimeInput({ value, onChange }) {
  return createElement('input', {
    type: 'datetime-local',
    lang: 'ar',
    value: toInputValue(value),
    style,
    onChange: (e) => {
      // "2026-09-23T14:00" يُقرأ بالتوقيت المحلي
      const date = new Date(e.target.value);
      if (!Number.isNaN(date.getTime())) onChange(date);
    },
  });
}
