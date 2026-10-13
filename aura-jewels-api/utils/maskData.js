export const maskEmail = (email) => {
  if (!email) return '';
  const str = String(email).trim();
  const parts = str.split('@');
  if (parts.length !== 2) return str;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0] || ''}*@${domain}`;
  }
  const start = name.slice(0, 2);
  const end = name.slice(-1);
  const maskedLen = Math.max(3, name.length - 3);
  return `${start}${'*'.repeat(maskedLen)}${end}@${domain}`;
};
export const maskPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone).trim();
  const digits = str.replace(/\D/g, '');
  if (digits.length <= 5) return str;

  const start = digits.slice(0, 3);
  const end = digits.slice(-2);
  const maskedLen = digits.length - 5;
  return `${start}${'X'.repeat(maskedLen)}${end}`;
};