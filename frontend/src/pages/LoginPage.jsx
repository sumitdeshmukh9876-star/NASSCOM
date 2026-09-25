import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, TrendingUp, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/Toast';

const LoginPage = ({ goToSignup }) => {
  const { login } = useAuth();
  const { toast, showToast, closeToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back! Loading your dashboard...', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'demo@financeai.com', password: 'demo1234' });
    showToast('Demo credentials filled. Click Sign In to continue.', 'info');
  };

  return (
    <div className="min-h-screen flex">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FinanceAI</h1>
              <p className="text-emerald-400 text-xs font-medium">Personal Financial Advisor</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your AI-powered<br />
              <span className="text-emerald-400">money mentor</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Get personalized budgeting, savings plans, and debt strategies powered by cutting-edge AI.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📊', label: 'Expense & Budget Analytics' },
              { icon: '🤖', label: 'AI Advisor with Gemini' },
              { icon: '🎯', label: 'Goal Tracking & Progress' },
              { icon: '🔒', label: 'Bank-Grade Security' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
                <span className="text-slate-200 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-xs">AI responses are educational and not professional financial advice.</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-slate-50">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-800">FinanceAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-1.5">Welcome back</h2>
            <p className="text-slate-500">Sign in to access your financial dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  id="login-email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  id="login-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-3 px-4 gradient-emerald text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Signing in...</>
              ) : (
                <><span>Sign In</span><ArrowRight size={17} /></>
              )}
            </button>

            {/* Demo fill */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <TrendingUp size={16} className="text-emerald-500" />
              Fill Demo Credentials
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={goToSignup} className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
