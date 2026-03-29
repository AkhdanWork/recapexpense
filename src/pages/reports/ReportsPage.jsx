// src/pages/reports/ReportsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, calcSummary } from '../../services/transactionService';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import { getCategoryById, CHART_COLORS } from '../../utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { Printer, Loader2, CalendarDays, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_TABS = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-sm border border-white/20">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-muted text-xs">{title}</p>
      <p className="text-white font-bold text-lg">{formatCurrency(value)}</p>
    </div>
  </div>
);

const ReportsPage = () => {
  const { user, userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  // Filters
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDateISO(now));
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  function formatDateISO(d) {
    return d.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getTransactions(user.uid);
        setTransactions(data);
      } catch {
        toast.error('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // Filter transactions based on report type
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      if (activeTab === 'daily') {
        return formatDateISO(d) === selectedDate;
      } else if (activeTab === 'weekly') {
        const target = new Date(selectedDate);
        const weekStart = new Date(target);
        weekStart.setDate(target.getDate() - target.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
      } else if (activeTab === 'monthly') {
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      } else {
        return d.getFullYear() === selectedYear;
      }
    });
  }, [transactions, activeTab, selectedDate, selectedMonth, selectedYear]);

  const summary = useMemo(() => calcSummary(filtered, userProfile?.initialBalance || 0), [filtered, userProfile]);

  // Chart data
  const chartData = useMemo(() => {
    if (activeTab === 'daily') {
      return filtered.map((t) => ({
        label: t.description?.substring(0, 15),
        pemasukan: t.type === 'pemasukan' ? t.amount : 0,
        pengeluaran: t.type === 'pengeluaran' ? t.amount : 0,
      }));
    } else if (activeTab === 'weekly') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const map = {};
      days.forEach((d) => { map[d] = { label: d, pemasukan: 0, pengeluaran: 0 }; });
      filtered.forEach((t) => {
        const d = t.date instanceof Date ? t.date : new Date(t.date);
        const day = days[d.getDay()];
        if (t.type === 'pemasukan') map[day].pemasukan += t.amount;
        else map[day].pengeluaran += t.amount;
      });
      return Object.values(map);
    } else if (activeTab === 'monthly') {
      const map = {};
      filtered.forEach((t) => {
        const d = t.date instanceof Date ? t.date : new Date(t.date);
        const key = d.getDate();
        if (!map[key]) map[key] = { label: String(key), pemasukan: 0, pengeluaran: 0 };
        if (t.type === 'pemasukan') map[key].pemasukan += t.amount;
        else map[key].pengeluaran += t.amount;
      });
      return Object.values(map).sort((a, b) => Number(a.label) - Number(b.label));
    } else {
      const months = Array.from({ length: 12 }, (_, i) => ({
        label: getMonthName(i).substring(0, 3),
        pemasukan: 0,
        pengeluaran: 0,
      }));
      filtered.forEach((t) => {
        const d = t.date instanceof Date ? t.date : new Date(t.date);
        const m = d.getMonth();
        if (t.type === 'pemasukan') months[m].pemasukan += t.amount;
        else months[m].pengeluaran += t.amount;
      });
      return months;
    }
  }, [filtered, activeTab]);

  const periodLabel = useMemo(() => {
    if (activeTab === 'daily') return `Hari: ${formatDate(new Date(selectedDate))}`;
    if (activeTab === 'weekly') {
      const target = new Date(selectedDate);
      const weekStart = new Date(target);
      weekStart.setDate(target.getDate() - target.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }
    if (activeTab === 'monthly') return `${getMonthName(selectedMonth)} ${selectedYear}`;
    return `Tahun ${selectedYear}`;
  }, [activeTab, selectedDate, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-muted text-sm flex items-center gap-1.5 mt-0.5">
            <CalendarDays className="w-4 h-4" /> {periodLabel}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary no-print">
          <Printer className="w-4 h-4" /> Cetak / PDF
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 glass-card-light p-1 w-fit">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3">
        {(activeTab === 'daily' || activeTab === 'weekly') && (
          <div>
            <label className="label">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field !py-2 text-sm"
            />
          </div>
        )}
        {activeTab === 'monthly' && (
          <>
            <div>
              <label className="label">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="input-field !py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i} className="bg-dark-800">{getMonthName(i)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input-field !py-2 text-sm"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-dark-800">{y}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {activeTab === 'yearly' && (
          <div>
            <label className="label">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field !py-2 text-sm"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-dark-800">{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Pemasukan" value={summary.totalIncome} icon={TrendingUp} color="bg-income/20 text-income" />
        <SummaryCard title="Total Pengeluaran" value={summary.totalExpense} icon={TrendingDown} color="bg-expense/20 text-expense" />
        <SummaryCard title="Saldo" value={summary.balance} icon={Wallet} color="bg-primary-500/20 text-primary-400" />
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Grafik Pemasukan &amp; Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="section-title">Detail Transaksi</h3>
          <p className="text-muted text-sm">{filtered.length} transaksi</p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p>Tidak ada transaksi untuk periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-700/50">
                <tr className="text-muted">
                  <th className="text-left px-5 py-3 font-medium">No</th>
                  <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-5 py-3 font-medium">Keterangan</th>
                  <th className="text-right px-5 py-3 font-medium">Pengeluaran</th>
                  <th className="text-right px-5 py-3 font-medium">Pemasukan</th>
                  <th className="text-left px-5 py-3 font-medium">Kategori</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const cat = getCategoryById(t.category);
                  return (
                    <tr key={t.id} className="table-row-hover border-b border-white/5">
                      <td className="px-5 py-3 text-muted text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-5 py-3 text-slate-200 max-w-xs">
                        <span className="line-clamp-1">{t.description}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-expense font-medium">
                        {t.type === 'pengeluaran' ? formatCurrency(t.amount) : '-'}
                      </td>
                      <td className="px-5 py-3 text-right text-income font-medium">
                        {t.type === 'pemasukan' ? formatCurrency(t.amount) : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${cat.bgColor} ${cat.textColor}`}>{cat.name}</span>
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-dark-700/50 font-semibold">
                  <td colSpan={3} className="px-5 py-3 text-slate-300">Total</td>
                  <td className="px-5 py-3 text-right text-expense">{formatCurrency(summary.totalExpense)}</td>
                  <td className="px-5 py-3 text-right text-income">{formatCurrency(summary.totalIncome)}</td>
                  <td className="px-5 py-3" />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
