// src/utils/formatters.js
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateLong = (date) => {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
};

export const getMonthName = (monthIndex) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex];
};

export const getWeekOfYear = (date) => {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d - startOfYear;
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
};

export const abbreviateNumber = (num) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}jt`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}rb`;
  return String(num);
};
