// src/pages/transactions/TransactionListPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, deleteTransaction } from '../../services/transactionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryById, CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  Plus, Search, Trash2, Pencil, Image, X,
  Filter, Loader2, Receipt, ChevronLeft, ChevronRight,
} from 'lucide-react';

const PAGE_SIZE = 15;

const ImageModal = ({ url, onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
    <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white cursor-pointer">
        <X className="w-6 h-6" />
      </button>
      <img src={url} alt="Struk" className="w-full rounded-2xl max-h-[80vh] object-contain" />
    </div>
  </div>
);

const TransactionListPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [viewImage, setViewImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(user.uid);
      setTransactions(data);
    } catch {
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || t.category === filterCat;
      const matchType = !filterType || t.type === filterType;
      return matchSearch && matchCat && matchType;
    });
  }, [transactions, search, filterCat, filterType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (t) => {
    if (!window.confirm(`Hapus transaksi "${t.description}"?`)) return;
    setDeletingId(t.id);
    try {
      await deleteTransaction(t.id, t.receipt?.path);
      setTransactions((prev) => prev.filter((x) => x.id !== t.id));
      toast.success('Transaksi dihapus');
    } catch {
      toast.error('Gagal menghapus transaksi');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaksi</h1>
          <p className="text-muted text-sm">{filtered.length} transaksi ditemukan</p>
        </div>
        <Link to="/transactions/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Transaksi
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
              className="input-field pl-9 pr-3 !py-2 text-sm min-w-[130px]"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="input-field !py-2 text-sm min-w-[130px]"
          >
            <option value="">Semua Tipe</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" /> Memuat...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada transaksi</p>
            <p className="text-sm mt-1">Coba ubah filter atau tambah transaksi baru</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-700/50 border-b border-white/5">
                  <tr className="text-muted">
                    <th className="text-left px-5 py-3 font-medium w-8">No</th>
                    <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                    <th className="text-left px-5 py-3 font-medium">Keterangan</th>
                    <th className="text-right px-5 py-3 font-medium">Pengeluaran</th>
                    <th className="text-right px-5 py-3 font-medium">Pemasukan</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Kategori</th>
                    <th className="text-center px-5 py-3 font-medium">Struk</th>
                    <th className="text-center px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => {
                    const cat = getCategoryById(t.category);
                    const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                    return (
                      <tr key={t.id} className="table-row-hover border-b border-white/5">
                        <td className="px-5 py-3.5 text-muted text-xs">{rowNum}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="px-5 py-3.5 text-slate-200 max-w-[200px]">
                          <span className="line-clamp-1">{t.description}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-expense font-medium">
                          {t.type === 'pengeluaran' ? formatCurrency(t.amount) : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right text-income font-medium">
                          {t.type === 'pemasukan' ? formatCurrency(t.amount) : '-'}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className={`badge ${cat.bgColor} ${cat.textColor}`}>{cat.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {t.receipt?.url ? (
                            <button
                              onClick={() => setViewImage(t.receipt.url)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors cursor-pointer"
                              title="Lihat struk"
                            >
                              <Image className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              to={`/transactions/${t.id}/edit`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-dark-700 text-slate-400 hover:text-white hover:bg-dark-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(t)}
                              disabled={deletingId === t.id}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-expense/10 text-expense hover:bg-expense/20 transition-colors cursor-pointer disabled:opacity-50"
                              title="Hapus"
                            >
                              {deletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                <span className="text-sm text-muted">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary !px-2.5 !py-1.5 text-xs disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary !px-2.5 !py-1.5 text-xs disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal */}
      {viewImage && <ImageModal url={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
};

export default TransactionListPage;
