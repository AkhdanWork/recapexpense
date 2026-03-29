// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, TrendingUp } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Email reset password telah dikirim!');
    } catch (err) {
      toast.error('Gagal mengirim email. Periksa kembali alamat email kamu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RecapExpense</h1>
        </div>

        <div className="glass-card p-8">
          <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>

          <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400 text-sm mb-6">
            Masukkan email kamu dan kami akan mengirimkan link untuk reset password.
          </p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-income/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-income" />
              </div>
              <h3 className="text-white font-semibold mb-2">Email Terkirim!</h3>
              <p className="text-slate-400 text-sm">
                Cek inbox email kamu dan klik link yang dikirimkan untuk reset password.
              </p>
              <Link to="/login" className="btn-primary mt-6 justify-center">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="input-field"
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' },
                  })}
                />
                {errors.email && <p className="text-expense text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Kirim Email Reset
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
