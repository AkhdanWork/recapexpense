// src/pages/dashboard/DashboardPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, calcSummary } from '../../services/transactionService';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import { getCategoryById, CHART_COLORS } from '../../utils/constants';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, Plus,
  ArrowRight, Calendar, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, amount, icon: Icon, colorClass, glowClass, subtitle }) => (
  <div className={`stat-card ${glowClass}`}>
    <div className="flex items-center justify-between">
      <span className="text-muted text-sm font-medium">{title}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-2xl font-bold text-white mt-1">{formatCurrency(amount)}</div>
    {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
  </div>
);

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

const DashboardPage = () => {
  const { user, userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTransactions(user.uid);
        setTransactions(data);
      } catch (err) {
        toast.error('Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }), [transactions, selectedMonth, selectedYear]);

  const summary = useMemo(() =>
    calcSummary(filtered, userProfile?.initialBalance || 0),
    [filtered, userProfile]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type === 'pengeluaran').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, value]) => ({ name: getCategoryById(id).name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Daily chart data for current month
  const dailyData = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      const key = d.getDate();
      if (!map[key]) map[key] = { day: `${key}`, pemasukan: 0, pengeluaran: 0 };
      if (t.type === 'pemasukan') map[key].pemasukan += t.amount;
      else map[key].pengeluaran += t.amount;
    });
    return Object.values(map).sort((a, b) => Number(a.day) - Number(b.day));
  }, [filtered]);

  const recentTransactions = useMemo(() =>
    transactions.slice(0, 8), [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">
            Selamat datang, {user?.displayName || 'User'} 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month picker */}
          <div className="flex items-center gap-2 glass-card-light px-3 py-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-sm outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i} className="bg-dark-800">{getMonthName(i)}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-sm outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-dark-800">{y}</option>
              ))}
            </select>
          </div>
          <Link to="/transactions/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Pemasukan"
          amount={summary.totalIncome}
          icon={TrendingUp}
          colorClass="bg-income/20 text-income"
          glowClass="border-l-4 border-income/50"
          subtitle={`${getMonthName(selectedMonth)} ${selectedYear}`}
        />
        <StatCard
          title="Total Pengeluaran"
          amount={summary.totalExpense}
          icon={TrendingDown}
          colorClass="bg-expense/20 text-expense"
          glowClass="border-l-4 border-expense/50"
          subtitle={`${getMonthName(selectedMonth)} ${selectedYear}`}
        />
        <StatCard
          title="Saldo"
          amount={summary.balance}
          icon={Wallet}
          colorClass="bg-primary-500/20 text-primary-400"
          glowClass="border-l-4 border-primary-500/50"
          subtitle="Pemasukan - Pengeluaran"
        />
        <StatCard
          title="Saldo Bawaan"
          amount={userProfile?.initialBalance || 0}
          icon={PiggyBank}
          colorClass="bg-amber-500/20 text-amber-400"
          glowClass="border-l-4 border-amber-500/50"
          subtitle="Dapat diubah di profil"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">Tren Keuangan — {getMonthName(selectedMonth)} {selectedYear}</h3>
          {dailyData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted">Belum ada data bulan ini</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#22C55E" fill="url(#colorPemasukan)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#EF4444" fill="url(#colorPengeluaran)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Pengeluaran per Kategori</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted">Belum ada data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-slate-200 font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Transaksi Terbaru</h3>
          <Link to="/transactions" className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada transaksi. Mulai catat pemasukan atau pengeluaran!</p>
            <Link to="/transactions/new" className="btn-primary mt-4 justify-center">
              <Plus className="w-4 h-4" /> Tambah Transaksi
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b border-white/5">
                  <th className="text-left py-2 pr-4 font-medium">Tanggal</th>
                  <th className="text-left py-2 pr-4 font-medium">Keterangan</th>
                  <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-2 font-medium">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => {
                  const cat = getCategoryById(t.category);
                  return (
                    <tr key={t.id} className="table-row-hover border-b border-white/5">
                      <td className="py-3 pr-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="py-3 pr-4 text-slate-200 max-w-[200px] truncate">{t.description}</td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className={`badge ${cat.bgColor} ${cat.textColor}`}>{cat.name}</span>
                      </td>
                      <td className={`py-3 text-right font-semibold ${t.type === 'pemasukan' ? 'text-income' : 'text-expense'}`}>
                        {t.type === 'pemasukan' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
