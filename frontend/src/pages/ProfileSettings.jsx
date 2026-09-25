import { useState, useEffect } from 'react';
import {
  User, Mail, Briefcase, DollarSign, PiggyBank, CreditCard, TrendingUp,
  Target, Save, Loader2, Settings2, Database, Shield, Key, Globe
} from 'lucide-react';
import { authAPI, financeAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/Toast';

const CURRENCIES = ['$', '€', '£', '¥', '₹', 'A$', 'C$', '₩'];

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const { toast, showToast, closeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingFinance, setSavingFinance] = useState(false);

  const [userForm, setUserForm] = useState({ name: '', email: '', occupation: '', currency: '$' });
  const [financeForm, setFinanceForm] = useState({
    monthlyIncome: '', currentSavings: '', totalDebt: '',
    riskPreference: 'Moderate', monthlySavingsTarget: '', budgetLimit: '', emergencyFundMonthsTarget: 6
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [meRes, finRes] = await Promise.all([authAPI.getMe(), financeAPI.getProfile()]);
        const u = meRes.data.user;
        setUserForm({ name: u.name || '', email: u.email || '', occupation: u.occupation || '', currency: u.currency || '$' });
        const p = finRes.data.profile || {};
        setFinanceForm({
          monthlyIncome: p.monthlyIncome || '',
          currentSavings: p.currentSavings || '',
          totalDebt: p.totalDebt || '',
          riskPreference: p.riskPreference || 'Moderate',
          monthlySavingsTarget: p.monthlySavingsTarget || '',
          budgetLimit: p.budgetLimit || '',
          emergencyFundMonthsTarget: p.emergencyFundMonthsTarget || 6,
        });
      } catch { showToast('Failed to load profile data', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name) { showToast('Name is required', 'warning'); return; }
    setSavingUser(true);
    try {
      const res = await authAPI.updateProfile({ name: userForm.name, occupation: userForm.occupation, currency: userForm.currency });
      updateUser(res.data.user);
      showToast('Account information updated!', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSavingUser(false); }
  };

  const handleSaveFinance = async (e) => {
    e.preventDefault();
    setSavingFinance(true);
    try {
      await financeAPI.updateProfile({
        monthlyIncome: Number(financeForm.monthlyIncome) || 0,
        currentSavings: Number(financeForm.currentSavings) || 0,
        totalDebt: Number(financeForm.totalDebt) || 0,
        riskPreference: financeForm.riskPreference,
        monthlySavingsTarget: Number(financeForm.monthlySavingsTarget) || 0,
        budgetLimit: Number(financeForm.budgetLimit) || 0,
        emergencyFundMonthsTarget: Number(financeForm.emergencyFundMonthsTarget) || 6,
      });
      showToast('Financial profile saved!', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSavingFinance(false); }
  };

  const uf = (k, v) => setUserForm((p) => ({ ...p, [k]: v }));
  const ff = (k, v) => setFinanceForm((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-[900px] mx-auto w-full">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile & Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your personal and financial preferences</p>
      </div>

      {/* User Avatar header card */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{user?.name || 'User'}</h2>
          <p className="text-slate-300 text-sm">{user?.email || ''}</p>
          {user?.occupation && <p className="text-emerald-400 text-xs mt-0.5">{user.occupation}</p>}
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs text-slate-400">Member since</p>
          <p className="text-sm text-slate-200 font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <User size={17} className="text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Account Information</h3>
        </div>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => uf('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (read-only)</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={userForm.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={userForm.occupation}
                  onChange={(e) => uf('occupation', e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency Symbol</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={userForm.currency}
                  onChange={(e) => uf('currency', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingUser} className="flex items-center gap-2 px-5 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70">
              {savingUser ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Account Info
            </button>
          </div>
        </form>
      </div>

      {/* Financial Profile Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Settings2 size={17} className="text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Financial Profile</h3>
        </div>
        <form onSubmit={handleSaveFinance} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'monthlyIncome', label: 'Monthly Income ($)', icon: DollarSign },
              { key: 'currentSavings', label: 'Current Savings ($)', icon: PiggyBank },
              { key: 'totalDebt', label: 'Total Debt ($)', icon: CreditCard },
              { key: 'monthlySavingsTarget', label: 'Monthly Savings Target ($)', icon: TrendingUp },
              { key: 'budgetLimit', label: 'Monthly Budget Limit ($)', icon: Target },
              { key: 'emergencyFundMonthsTarget', label: 'Emergency Fund (months)', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min={key === 'emergencyFundMonthsTarget' ? 1 : 0}
                    max={key === 'emergencyFundMonthsTarget' ? 24 : undefined}
                    value={financeForm[key]}
                    onChange={(e) => ff(key, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Risk preference */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Risk Preference</label>
            <div className="flex gap-2">
              {['Conservative', 'Moderate', 'Aggressive'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => ff('riskPreference', r)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${financeForm.riskPreference === r ? 'gradient-emerald text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingFinance} className="flex items-center gap-2 px-5 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70">
              {savingFinance ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Financial Profile
            </button>
          </div>
        </form>
      </div>

      {/* Security info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
            <Shield size={17} className="text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Security & Privacy</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: Key, label: 'JWT Authentication', desc: 'Secure token-based sessions valid for 30 days', status: 'Active' },
            { icon: Shield, label: 'Password Encryption', desc: 'bcrypt hashing with salt rounds for secure storage', status: 'Enabled' },
            { icon: Database, label: 'Data Isolation', desc: 'Your financial data is fully private and user-scoped', status: 'Protected' },
          ].map(({ icon: Icon, label, desc, status }) => (
            <div key={label} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
