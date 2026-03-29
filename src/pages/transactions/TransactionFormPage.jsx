// src/pages/transactions/TransactionFormPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { addTransaction, updateTransaction, getTransactions } from '../../services/transactionService';
import { formatDateForInput } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, X, Loader2, Image } from 'lucide-react';

const TransactionFormPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [oldTransaction, setOldTransaction] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: formatDateForInput(new Date()),
      type: 'pengeluaran',
      category: 'belanja',
    },
  });

  const selectedType = watch('type');

  // Fetch existing transaction for edit
  useEffect(() => {
    if (!isEdit || !user) return;
    const fetch = async () => {
      try {
        const all = await getTransactions(user.uid);
        const t = all.find((x) => x.id === id);
        if (t) {
          setOldTransaction(t);
          setValue('date', formatDateForInput(t.date));
          setValue('description', t.description);
          setValue('amount', t.amount);
          setValue('type', t.type);
          setValue('category', t.category);
          if (t.receipt?.url) {
            setExistingReceipt(t.receipt);
            setReceiptPreview(t.receipt.url);
          }
        }
      } catch {
        toast.error('Gagal memuat data transaksi');
      } finally {
        setFetchLoading(false);
      }
    };
    fetch();
  }, [id, isEdit, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceipt(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateTransaction(id, { ...data, userId: user.uid, receipt: existingReceipt }, receiptFile, receiptFile ? oldTransaction?.receipt?.path : null);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await addTransaction(user.uid, data, receiptFile);
        toast.success('Transaksi berhasil ditambahkan');
      }
      navigate('/transactions');
    } catch (err) {
      toast.error('Gagal menyimpan transaksi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary !px-3 !py-2.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h1>
          <p className="text-muted text-sm">{isEdit ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-5">
        {/* Type selector */}
        <div>
          <label className="label">Tipe Transaksi</label>
          <div className="grid grid-cols-2 gap-3">
            {['pengeluaran', 'pemasukan'].map((type) => (
              <label
                key={type}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedType === type
                    ? type === 'pemasukan'
                      ? 'border-income bg-income/10 text-income'
                      : 'border-expense bg-expense/10 text-expense'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <input type="radio" value={type} {...register('type')} className="sr-only" />
                <span className="font-medium capitalize">{type === 'pengeluaran' ? '💸 Pengeluaran' : '💰 Pemasukan'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Tanggal</label>
          <input
            type="date"
            className="input-field"
            {...register('date', { required: 'Tanggal wajib diisi' })}
          />
          {errors.date && <p className="text-expense text-xs mt-1">{errors.date.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Keterangan</label>
          <input
            type="text"
            placeholder="Contoh: Belanja bulanan di supermarket"
            className="input-field"
            {...register('description', { required: 'Keterangan wajib diisi' })}
          />
          {errors.description && <p className="text-expense text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="label">Jumlah (Rp)</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            className="input-field"
            {...register('amount', {
              required: 'Jumlah wajib diisi',
              min: { value: 1, message: 'Jumlah harus lebih dari 0' },
            })}
          />
          {errors.amount && <p className="text-expense text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Kategori</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const field = register('category', { required: true });
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    watch('category') === cat.id
                      ? `${cat.bgColor} border-current ${cat.textColor}`
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <input type="radio" value={cat.id} {...field} className="sr-only" />
                  <span className="text-sm font-medium">{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="label">Struk / Bukti Pembayaran</label>
          {receiptPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={receiptPreview} alt="Struk" className="w-full max-h-64 object-contain bg-dark-700" />
              <button
                type="button"
                onClick={removeReceipt}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-expense flex items-center justify-center cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all">
              <Image className="w-8 h-8 text-slate-500 mb-2" />
              <span className="text-slate-400 text-sm">Klik untuk upload foto struk</span>
              <span className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP (maks. 5MB)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {isEdit ? 'Perbarui' : 'Simpan'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionFormPage;
