// src/components/Layout.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, List, BarChart3, Tag, LogOut,
  TrendingUp, Menu, X, User, ChevronDown,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: List, label: 'Transaksi' },
  { to: '/reports', icon: BarChart3, label: 'Laporan' },
  { to: '/categories', icon: Tag, label: 'Kategori' },
];

const Layout = ({ children }) => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil keluar');
      navigate('/login');
    } catch {
      toast.error('Gagal keluar');
    }
  };

  const displayName = user?.displayName || userProfile?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-white/5 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg">Smart</span>
            <span className="text-primary-400 font-bold text-lg">Expense</span>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'sidebar-item-active' : 'sidebar-item'
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{displayName}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
            </button>

            {userDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 glass-card p-1 animate-fade-in">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-expense hover:bg-expense/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 p-4 bg-dark-800 border-b border-white/5 sticky top-0 z-10">
          <button
            className="text-slate-400 hover:text-white cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">RecapExpense</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
