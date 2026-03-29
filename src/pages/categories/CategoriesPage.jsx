// src/pages/categories/CategoriesPage.jsx
import { useState } from 'react';
import { CATEGORIES } from '../../utils/constants';
import { Tag, Info } from 'lucide-react';

const CategoriesPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Kategori</h1>
        <p className="text-muted text-sm mt-0.5">Daftar kategori transaksi yang tersedia</p>
      </div>

      {/* Info */}
      <div className="glass-card p-4 flex items-start gap-3 border-l-4 border-primary-500/50">
        <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-200 text-sm font-medium">Kategori Default</p>
          <p className="text-muted text-sm mt-0.5">
            Saat ini tersedia {CATEGORIES.length} kategori default. Kategori ini digunakan saat mencatat transaksi.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`glass-card p-5 flex items-center gap-4 border-l-4 transition-all hover:scale-[1.02] cursor-default`}
            style={{ borderLeftColor: cat.color }}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bgColor}`}
            >
              <Tag className={`w-5 h-5 ${cat.textColor}`} />
            </div>
            <div>
              <p className="text-white font-semibold">{cat.name}</p>
              <span className={`badge ${cat.bgColor} ${cat.textColor} mt-1`}>
                #{cat.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Usage note */}
      <div className="glass-card p-5 text-center">
        <Tag className="w-10 h-10 text-primary-400 mx-auto mb-3 opacity-50" />
        <p className="text-slate-300 font-medium">Gunakan kategori ini saat menambah transaksi</p>
        <p className="text-muted text-sm mt-1">
          Kategori membantu kamu melacak dan menganalisis pola pengeluaran dengan lebih mudah
        </p>
      </div>
    </div>
  );
};

export default CategoriesPage;
