import { useState } from 'react';
import {
  LayoutDashboard, BrainCircuit, Receipt, Target, Settings, LogOut,
  Menu, X, TrendingUp, ChevronRight, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'advisor', label: 'AI Advisor', icon: BrainCircuit },
  { id: 'expenses', label: 'Budget & Expenses', icon: Receipt },
  { id: 'goals', label: 'Financial Goals', icon: Target },
  { id: 'profile', label: 'Profile & Settings', icon: Settings },
];

const Sidebar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-emerald flex items-center justify-center shadow-md">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">FinanceAI</h1>
            <p className="text-xs text-slate-400 leading-none">Personal Advisor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500 transition-colors'} />
              <span className="flex-1 text-left">{label}</span>
              {isActive && <ChevronRight size={14} className="text-white/70" />}
            </button>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm flex-shrink-0 fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center shadow-sm">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800">FinanceAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
