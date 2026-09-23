// تعريف أنواع الباركود: الحقول، والتحقق، وطريقة تحويل البيانات إلى نص الباركود.

// تحويل الأرقام العربية/الفارسية إلى أرقام لاتينية
export function toLatinDigits(value = '') {
  return String(value)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.');
}

function cleanPhone(value) {
  // يبقي على الأرقام وعلامة + في البداية فقط
  const v = toLatinDigits(value).trim();
  const plus = v.startsWith('+') ? '+' : '';
  return plus + v.replace(/[^\d]/g, '');
}

// رقم واتساب يجب أن يكون دولياً بدون + أو 00
function whatsappNumber(value) {
  let digits = toLatinDigits(value).replace(/[^\d]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  // تسهيل للأرقام السعودية المكتوبة محلياً: 05xxxxxxxx ← 9665xxxxxxxx
  if (/^05\d{8}$/.test(digits)) digits = '966' + digits.slice(1);
  return digits;
}

// تهريب الأحرف الخاصة في صيغة الواي فاي
function escapeWifi(value) {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

// تهريب الأحرف الخاصة في صيغة vCard / iCalendar
function escapeCard(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/([;,])/g, '\\$1');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// وقت محلي بصيغة iCalendar: 20260923T143000
function icsDate(date) {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  );
}

function parseCoordinate(value, max) {
  const v = toLatinDigits(value).trim().replace(/,/g, '.');
  if (!/^-?\d+(\.\d+)?$/.test(v)) return null;
  const n = Number(v);
  return Math.abs(n) <= max ? n : null;
}

// محاولة استخراج الإحداثيات من رابط خرائط جوجل
function coordsFromMapsLink(link) {
  let text = toLatinDigits(link);
  try {
    text = decodeURIComponent(text);
  } catch {
    // نستخدم الرابط كما هو إذا لم يكن الترميز صحيحاً
  }
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return { lat: m[1], lng: m[2] };
  }
  return null;
}

function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const QR_TYPES = [
  {
    id: 'menu',
    title: 'منيو',
    description: 'ارفع صورة أو ملف PDF للمنيو ويتحول إلى باركود مباشرة',
    icon: 'restaurant',
    // يُنشأ الباركود تلقائياً بمجرد انتهاء الرفع
    autoGenerate: true,
    fields: [{ key: 'file', label: 'ملف المنيو', type: 'upload', required: true }],
    build: ({ file }) => file.url,
  },
  {
    id: 'url',
    title: 'رابط',
    description: 'رابط موقع أو صفحة إنترنت',
    icon: 'link',
    fields: [
      {
        key: 'url',
        label: 'الرابط',
        placeholder: 'اكتب الرابط أو الصقه هنا',
        keyboard: 'url',
        required: true,
      },
    ],
    build: ({ url }) => {
      const v = url.trim();
      if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return 'https://' + v;
      return v;
    },
  },
  {
    id: 'text',
    title: 'نص',
    description: 'أي نص أو ملاحظة',
    icon: 'document-text',
    fields: [
      { key: 'text', label: 'النص', placeholder: 'اكتب النص هنا', multiline: true, required: true },
    ],
    build: ({ text }) => text,
  },
  {
    id: 'contact',
    title: 'جهة اتصال',
    description: 'بطاقة تعريف تُحفظ في جهات الاتصال',
    icon: 'person',
    fields: [
      { key: 'firstName', label: 'الاسم الأول', required: true },
      { key: 'lastName', label: 'الاسم الأخير' },
      { key: 'phone', label: 'رقم الجوال', keyboard: 'phone', placeholder: 'مثال: 0512345678' },
      {
        key: 'email',
        label: 'البريد الإلكتروني',
        keyboard: 'email',
        placeholder: 'اكتب البريد الإلكتروني',
      },
      { key: 'company', label: 'اسم الشركة' },
      { key: 'jobTitle', label: 'المسمى الوظيفي' },
    ],
    validate: ({ email }) =>
      email.trim() && !isEmail(email) ? 'البريد الإلكتروني غير صحيح' : null,
    build: ({ firstName, lastName, phone, email, company, jobTitle }) => {
      const first = firstName.trim();
      const last = lastName.trim();
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeCard(last)};${escapeCard(first)};;;`,
        `FN:${escapeCard([first, last].filter(Boolean).join(' '))}`,
      ];
      if (company.trim()) lines.push(`ORG:${escapeCard(company.trim())}`);
      if (jobTitle.trim()) lines.push(`TITLE:${escapeCard(jobTitle.trim())}`);
      if (phone.trim()) lines.push(`TEL;TYPE=CELL:${cleanPhone(phone)}`);
      if (email.trim()) lines.push(`EMAIL:${email.trim()}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
  },
  {
    id: 'wifi',
    title: 'واي فاي',
    description: 'اتصال مباشر بالشبكة بدون كتابة كلمة المرور',
    icon: 'wifi',
    fields: [
      { key: 'ssid', label: 'اسم الشبكة', required: true },
      {
        key: 'security',
        label: 'نوع الحماية',
        type: 'choice',
        options: [
          { value: 'WPA', label: 'بكلمة مرور' },
          { value: 'nopass', label: 'بدون كلمة مرور' },
        ],
        defaultValue: 'WPA',
      },
      {
        key: 'password',
        label: 'كلمة المرور',
        secure: true,
        showIf: (v) => v.security === 'WPA',
      },
    ],
    validate: ({ security, password }) =>
      security === 'WPA' && !password ? 'اكتب كلمة مرور الشبكة' : null,
    build: ({ ssid, security, password }) =>
      security === 'nopass'
        ? `WIFI:T:nopass;S:${escapeWifi(ssid)};;`
        : `WIFI:T:WPA;S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`,
  },
  {
    id: 'phone',
    title: 'اتصال هاتفي',
    description: 'يفتح شاشة الاتصال بالرقم مباشرة',
    icon: 'call',
    fields: [
      {
        key: 'phone',
        label: 'رقم الجوال',
        keyboard: 'phone',
        placeholder: 'مثال: 0512345678',
        required: true,
      },
    ],
    build: ({ phone }) => `tel:${cleanPhone(phone)}`,
  },
  {
    id: 'sms',
    title: 'رسالة نصية',
    description: 'رسالة نصية جاهزة لرقم محدد',
    icon: 'chatbox-ellipses',
    fields: [
      {
        key: 'phone',
        label: 'رقم الجوال',
        keyboard: 'phone',
        placeholder: 'مثال: 0512345678',
        required: true,
      },
      { key: 'message', label: 'نص الرسالة', multiline: true },
    ],
    build: ({ phone, message }) => `SMSTO:${cleanPhone(phone)}:${message}`,
  },
  {
    id: 'email',
    title: 'بريد إلكتروني',
    description: 'رسالة بريد جاهزة للإرسال',
    icon: 'mail',
    fields: [
      {
        key: 'to',
        label: 'البريد الإلكتروني',
        keyboard: 'email',
        placeholder: 'اكتب البريد الإلكتروني',
        required: true,
      },
      { key: 'subject', label: 'الموضوع' },
      { key: 'body', label: 'نص الرسالة', multiline: true },
    ],
    validate: ({ to }) => (!isEmail(to) ? 'البريد الإلكتروني غير صحيح' : null),
    build: ({ to, subject, body }) => {
      const params = [];
      if (subject.trim()) params.push('subject=' + encodeURIComponent(subject.trim()));
      if (body.trim()) params.push('body=' + encodeURIComponent(body));
      return `mailto:${to.trim()}${params.length ? '?' + params.join('&') : ''}`;
    },
  },
  {
    id: 'location',
    title: 'موقع جغرافي',
    description: 'يفتح الموقع على الخريطة',
    icon: 'location',
    fields: [
      {
        key: 'mode',
        label: 'طريقة الإدخال',
        type: 'choice',
        options: [
          { value: 'coords', label: 'إحداثيات' },
          { value: 'link', label: 'رابط خرائط جوجل' },
        ],
        defaultValue: 'coords',
      },
      {
        key: 'lat',
        label: 'خط العرض',
        keyboard: 'decimal',
        placeholder: 'مثال: 24.7136',
        showIf: (v) => v.mode === 'coords',
      },
      {
        key: 'lng',
        label: 'خط الطول',
        keyboard: 'decimal',
        placeholder: 'مثال: 46.6753',
        showIf: (v) => v.mode === 'coords',
      },
      {
        key: 'link',
        label: 'رابط الموقع',
        keyboard: 'url',
        placeholder: 'الصق رابط خرائط جوجل هنا',
        showIf: (v) => v.mode === 'link',
      },
    ],
    validate: ({ mode, lat, lng, link }) => {
      if (mode === 'link') {
        return /^https?:\/\/\S+$/i.test(link.trim()) ? null : 'الصق رابط الموقع كاملاً';
      }
      if (parseCoordinate(lat, 90) === null) return 'خط العرض غير صحيح (من ‎-90 إلى 90)';
      if (parseCoordinate(lng, 180) === null) return 'خط الطول غير صحيح (من ‎-180 إلى 180)';
      return null;
    },
    build: ({ mode, lat, lng, link }) => {
      if (mode === 'link') {
        const coords = coordsFromMapsLink(link);
        return coords ? mapsUrl(coords.lat, coords.lng) : link.trim();
      }
      return mapsUrl(parseCoordinate(lat, 90), parseCoordinate(lng, 180));
    },
  },
  {
    id: 'event',
    title: 'حدث تقويم',
    description: 'موعد يُضاف إلى التقويم',
    icon: 'calendar',
    fields: [
      { key: 'title', label: 'عنوان الحدث', required: true },
      { key: 'start', label: 'البداية', type: 'datetime', defaultValue: () => roundedDate(1) },
      { key: 'end', label: 'النهاية', type: 'datetime', defaultValue: () => roundedDate(2) },
      { key: 'location', label: 'المكان' },
    ],
    validate: ({ start, end }) => (end <= start ? 'وقت النهاية يجب أن يكون بعد وقت البداية' : null),
    build: ({ title, start, end, location }) => {
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${escapeCard(title.trim())}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
      ];
      if (location.trim()) lines.push(`LOCATION:${escapeCard(location.trim())}`);
      lines.push('END:VEVENT', 'END:VCALENDAR');
      return lines.join('\n');
    },
  },
  {
    id: 'whatsapp',
    title: 'واتساب',
    description: 'يفتح محادثة واتساب برسالة جاهزة',
    icon: 'logo-whatsapp',
    fields: [
      {
        key: 'phone',
        label: 'رقم الجوال مع رمز الدولة',
        keyboard: 'phone',
        placeholder: 'مثال: 966512345678',
        required: true,
      },
      { key: 'message', label: 'نص الرسالة', multiline: true },
    ],
    validate: ({ phone }) => (whatsappNumber(phone).length < 8 ? 'رقم الجوال غير صحيح' : null),
    build: ({ phone, message }) => {
      const text = message.trim() ? `?text=${encodeURIComponent(message)}` : '';
      return `https://wa.me/${whatsappNumber(phone)}${text}`;
    },
  },
];

// تاريخ بعد عدد من الساعات مقرّب للساعة
function roundedDate(hoursFromNow) {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

export function initialValues(type) {
  const values = {};
  for (const f of type.fields) {
    const def = f.defaultValue;
    values[f.key] = typeof def === 'function' ? def() : (def ?? '');
  }
  return values;
}

export function visibleFields(type, values) {
  return type.fields.filter((f) => !f.showIf || f.showIf(values));
}

// يعيد { error } أو { data }
export function buildPayload(type, values) {
  for (const f of visibleFields(type, values)) {
    if (f.required && !String(values[f.key] ?? '').trim()) {
      return { error: `اكتب ${f.label}` };
    }
  }
  const error = type.validate?.(values);
  if (error) return { error };
  const data = type.build(values);
  // حد السعة التقريبي لباركود QR بمستوى تصحيح عالٍ
  if (new TextEncoder().encode(data).length > 1200) {
    return { error: 'المحتوى طويل جداً، اختصر النص قليلاً' };
  }
  return { data };
}
