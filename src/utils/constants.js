// src/utils/constants.js
export const CATEGORIES = [
  { id: 'belanja', name: 'Belanja', color: '#6366F1', bgColor: 'bg-indigo-500/20', textColor: 'text-indigo-400', icon: '🛒' },
  { id: 'tagihan', name: 'Tagihan', color: '#F59E0B', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400', icon: '⚡' },
  { id: 'makanan', name: 'Makanan', color: '#EF4444', bgColor: 'bg-red-500/20', textColor: 'text-red-400', icon: '🍽️' },
  { id: 'deposito', name: 'Deposito', color: '#22C55E', bgColor: 'bg-green-500/20', textColor: 'text-green-400', icon: '💰' },
  { id: 'transportasi', name: 'Transportasi', color: '#3B82F6', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400', icon: '🚗' },
  { id: 'hiburan', name: 'Hiburan', color: '#EC4899', bgColor: 'bg-pink-500/20', textColor: 'text-pink-400', icon: '🎬' },
  { id: 'kesehatan', name: 'Kesehatan', color: '#14B8A6', bgColor: 'bg-teal-500/20', textColor: 'text-teal-400', icon: '🏥' },
  { id: 'pendidikan', name: 'Pendidikan', color: '#8B5CF6', bgColor: 'bg-violet-500/20', textColor: 'text-violet-400', icon: '📚' },
  { id: 'modal', name: 'Modal', color: '#06B6D4', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400', icon: '💼' },
  { id: 'lainnya', name: 'Lainnya', color: '#94A3B8', bgColor: 'bg-slate-500/20', textColor: 'text-slate-400', icon: '📌' },
];

export const TRANSACTION_TYPES = {
  INCOME: 'pemasukan',
  EXPENSE: 'pengeluaran',
};

export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const CHART_COLORS = [
  '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6',
  '#EC4899', '#14B8A6', '#8B5CF6', '#06B6D4', '#94A3B8',
];
