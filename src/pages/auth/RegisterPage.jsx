// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, TrendingUp } from 'lucide-react';

const RegisterPage = () => {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      toast.success('Akun berhasil dibuat! Selamat datang!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email sudah terdaftar'
        : err.code === 'auth/weak-password'
          ? 'Password terlalu lemah (min. 6 karakter)'
          : 'Registrasi gagal, coba lagi';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RecapExpense</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola keuangan dengan cerdas</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Buat Akun Baru</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama kamu"
                className="input-field"
                {...register('displayName', { required: 'Nama wajib diisi', minLength: { value: 2, message: 'Minimal 2 karakter' } })}
              />
              {errors.displayName && <p className="text-expense text-xs mt-1">{errors.displayName.message}</p>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  className="input-field pr-12"
                  {...register('password', { required: 'Password wajib diisi', minLength: { value: 6, message: 'Min. 6 karakter' } })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-expense text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Konfirmasi Password</label>
              <input
                type="password"
                placeholder="Ulangi password"
                className="input-field"
                {...register('confirmPassword', {
                  required: 'Konfirmasi password wajib diisi',
                  validate: (val) => val === password || 'Password tidak cocok',
                })}
              />
              {errors.confirmPassword && <p className="text-expense text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Daftar Sekarang
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
