// تحليل محتوى باركود ممسوح وتحويله إلى نوع وحقول واضحة وزر مناسب لفتحه.
import { Platform } from 'react-native';

import { coordsFromMapsLink } from './qrTypes';

function safeDecode(v = '') {
  try {
    return decodeURIComponent(v.replace(/\+/g, ' '));
  } catch {
    return v;
  }
}

function unescapeValue(v = '') {
  return v.replace(/\\n/gi, '\n').replace(/\\([\\;,:"])/g, '$1');
}

// قراءة حقول بصيغة KEY:VALUE؛ (مثل WIFI و MATMSG) مع مراعاة التهريب
function parseSemicolonFields(body) {
  const fields = {};
  const parts = [];
  let current = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '\\' && i + 1 < body.length) {
      current += ch + body[++i];
    } else if (ch === ';') {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  for (const part of parts) {
    const i = part.indexOf(':');
    if (i > 0) fields[part.slice(0, i).toUpperCase()] = unescapeValue(part.slice(i + 1));
  }
  return fields;
}

// قراءة أسطر vCard / iCalendar
function parseLines(text) {
  const fields = {};
  for (const raw of text.split(/\r?\n/)) {
    const i = raw.indexOf(':');
    if (i <= 0) continue;
    const key = raw.slice(0, i).split(';')[0].toUpperCase();
    if (!(key in fields)) fields[key] = unescapeValue(raw.slice(i + 1));
  }
  return fields;
}

function formatIcsDate(v) {
  const m = v?.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return v;
  return m[4] ? `${m[1]}/${m[2]}/${m[3]} - ${m[4]}:${m[5]}` : `${m[1]}/${m[2]}/${m[3]}`;
}

const rows = (pairs) => pairs.filter(([, value]) => value);

export function parseScanned(raw) {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (lower.startsWith('wifi:')) {
    const f = parseSemicolonFields(text.slice(5));
    const open = !f.P || (f.T || '').toLowerCase() === 'nopass';
    return {
      title: 'شبكة واي فاي',
      icon: 'wifi',
      rows: rows([
        ['اسم الشبكة', f.S],
        ['كلمة المرور', open ? 'بدون كلمة مرور' : f.P],
      ]),
      copyValue: open ? null : f.P,
      copyLabel: 'نسخ كلمة المرور',
    };
  }

  if (lower.startsWith('begin:vcard')) {
    const f = parseLines(text);
    const [last = '', first = ''] = (f.N || '').split(';');
    const phone = f.TEL;
    return {
      title: 'جهة اتصال',
      icon: 'person',
      rows: rows([
        ['الاسم', f.FN || [first, last].filter(Boolean).join(' ')],
        ['رقم الجوال', phone],
        ['البريد الإلكتروني', f.EMAIL],
        ['الشركة', f.ORG],
        ['المسمى الوظيفي', f.TITLE],
      ]),
      action: phone ? { label: 'اتصال بالرقم', icon: 'call', url: `tel:${phone}` } : null,
    };
  }

  if (lower.startsWith('begin:vcalendar') || lower.startsWith('begin:vevent')) {
    const f = parseLines(text);
    return {
      title: 'حدث تقويم',
      icon: 'calendar',
      rows: rows([
        ['العنوان', f.SUMMARY],
        ['البداية', formatIcsDate(f.DTSTART)],
        ['النهاية', formatIcsDate(f.DTEND)],
        ['المكان', f.LOCATION],
      ]),
    };
  }

  if (lower.startsWith('tel:')) {
    const number = text.slice(4);
    return {
      title: 'اتصال هاتفي',
      icon: 'call',
      rows: [['رقم الجوال', number]],
      action: { label: 'اتصال الآن', icon: 'call', url: `tel:${number}` },
    };
  }

  if (lower.startsWith('smsto:') || lower.startsWith('sms:')) {
    const body = text.slice(text.indexOf(':') + 1);
    let number = body;
    let message = '';
    if (lower.startsWith('smsto:')) {
      const i = body.indexOf(':');
      if (i >= 0) {
        number = body.slice(0, i);
        message = body.slice(i + 1);
      }
    } else {
      const [n, query = ''] = body.split('?');
      number = n;
      message = safeDecode((query.match(/body=([^&]*)/) || [])[1]);
    }
    // iOS يستخدم & قبل body بينما أندرويد يستخدم ?
    const bodyParam = message
      ? `${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`
      : '';
    return {
      title: 'رسالة نصية',
      icon: 'chatbox-ellipses',
      rows: rows([
        ['رقم الجوال', number],
        ['نص الرسالة', message],
      ]),
      action: {
        label: 'فتح الرسائل',
        icon: 'chatbox-ellipses',
        url: `sms:${number}${bodyParam}`,
      },
    };
  }

  if (lower.startsWith('mailto:')) {
    const [address, query = ''] = text.slice(7).split('?');
    const param = (name) =>
      safeDecode((query.match(new RegExp(`(?:^|&)${name}=([^&]*)`, 'i')) || [])[1]);
    return {
      title: 'بريد إلكتروني',
      icon: 'mail',
      rows: rows([
        ['إلى', address],
        ['الموضوع', param('subject')],
        ['نص الرسالة', param('body')],
      ]),
      action: { label: 'كتابة الرسالة', icon: 'mail', url: text },
    };
  }

  if (lower.startsWith('matmsg:')) {
    const f = parseSemicolonFields(text.slice(7));
    const url = `mailto:${f.TO || ''}?subject=${encodeURIComponent(f.SUB || '')}&body=${encodeURIComponent(f.BODY || '')}`;
    return {
      title: 'بريد إلكتروني',
      icon: 'mail',
      rows: rows([
        ['إلى', f.TO],
        ['الموضوع', f.SUB],
        ['نص الرسالة', f.BODY],
      ]),
      action: { label: 'كتابة الرسالة', icon: 'mail', url },
    };
  }

  if (lower.startsWith('geo:')) {
    const [lat, lng] = text.slice(4).split(/[,?;]/);
    return {
      title: 'موقع جغرافي',
      icon: 'location',
      rows: [['الإحداثيات', `${lat}, ${lng}`]],
      action: {
        label: 'فتح في الخرائط',
        icon: 'map',
        url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      },
    };
  }

  if (/^https?:\/\//i.test(text)) {
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(text)) {
      const number = (text.match(/wa\.me\/(\d+)/i) || text.match(/phone=(\d+)/i) || [])[1];
      const message = safeDecode((text.match(/[?&]text=([^&]*)/) || [])[1]);
      return {
        title: 'واتساب',
        icon: 'logo-whatsapp',
        rows: rows([
          ['رقم الجوال', number],
          ['نص الرسالة', message],
        ]),
        action: { label: 'فتح واتساب', icon: 'logo-whatsapp', url: text },
      };
    }
    if (/google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(text)) {
      const coords = coordsFromMapsLink(text);
      return {
        title: 'موقع جغرافي',
        icon: 'location',
        rows: rows([
          ['الإحداثيات', coords && `${coords.lat}, ${coords.lng}`],
          ['الرابط', text],
        ]),
        action: { label: 'فتح في الخرائط', icon: 'map', url: text },
        copyValue: text,
        copyLabel: 'نسخ الرابط',
      };
    }
    return {
      title: 'رابط',
      icon: 'link',
      rows: [['الرابط', text]],
      action: { label: 'فتح الرابط', icon: 'open', url: text },
      copyValue: text,
      copyLabel: 'نسخ الرابط',
    };
  }

  return {
    title: 'نص',
    icon: 'document-text',
    rows: [['المحتوى', raw]],
  };
}
