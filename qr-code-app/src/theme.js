import { I18nManager } from 'react-native';

// التطبيق عربي بالكامل، لذلك نبني الاتجاه يدوياً ليعمل بشكل صحيح
// سواء كان نظام الجهاز (أو Expo Go) مضبوطاً على اليمين لليسار أو لا.
// في وضع RTL يقلب React Native كلاً من flexDirection و textAlign تلقائياً،
// لذا نختار القيمة التي تنتج "البداية من اليمين" في الحالتين.
const isRTL = I18nManager.isRTL;

export const rtl = {
  row: isRTL ? 'row' : 'row-reverse',
  textAlign: isRTL ? 'left' : 'right',
  // بداية السطر (اليمين) في محور flex الأفقي
  alignStart: isRTL ? 'flex-start' : 'flex-end',
  // اسم الخاصية التي تعني "اليسار الفعلي" على الشاشة (RN يبدّل left/right في وضع RTL)
  left: isRTL ? 'right' : 'left',
  paddingLeft: isRTL ? 'paddingRight' : 'paddingLeft',
  // سهم "رجوع" يشير لليمين في الواجهات العربية
  backIcon: 'arrow-forward',
  forwardIcon: 'chevron-back',
};

export const colors = {
  primary: '#0E7C66',
  primaryDark: '#095C4C',
  primaryLight: '#E3F4EF',
  background: '#F5F7F6',
  card: '#FFFFFF',
  text: '#1B2420',
  textMuted: '#5E6B66',
  border: '#DCE3E0',
  danger: '#C62828',
  white: '#FFFFFF',
};

// ألوان جاهزة للباركود (كلها داكنة بما يكفي ليبقى الباركود قابلاً للقراءة)
export const qrColors = [
  { name: 'أسود', value: '#000000' },
  { name: 'أخضر', value: '#0E7C66' },
  { name: 'أزرق', value: '#1565C0' },
  { name: 'كحلي', value: '#1A237E' },
  { name: 'بنفسجي', value: '#6A1B9A' },
  { name: 'أحمر', value: '#C62828' },
  { name: 'بني', value: '#5D4037' },
  { name: 'برتقالي', value: '#D84315' },
];

export const font = {
  title: 26,
  heading: 20,
  body: 17,
  small: 15,
};

export const baseText = {
  color: colors.text,
  fontSize: font.body,
  textAlign: rtl.textAlign,
  writingDirection: 'rtl',
};
