import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Briefcase, ArrowRight, Loader2, Wallet, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/Toast';

const SignupPage = ({ goToLogin }) => {
  const { register } = useAuth();
  const { toast, showToast, closeToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', occupation: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (form.password !== form.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.occupation);
      showToast('Account created! Loading your dashboard...', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inp = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen flex">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FinanceAI</h1>
            <p className="text-emerald-400 text-xs font-medium">Personal Financial Advisor</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Start your journey to<br />
              <span className="text-emerald-400">financial freedom</span>
            </h2>
            <p className="text-slate-300 text-lg">Join thousands managing smarter finances with AI.</p>
          </div>
          <div className="space-y-3">
            {[
              'Free AI-powered financial analysis',
              'Real-time budget tracking',
              'Smart debt repayment strategies',
              'Visual goal progress monitoring',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-500 text-xs">AI output is educational only and not professional advice.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-slate-50 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-800">FinanceAI</span>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-bold text-slate-900 mb-1.5">Create account</h2>
            <p className="text-slate-500">Get your free AI financial advisor today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name <span className="text-red-400">*</span></label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="signup-name"
                  value={form.name}
                  onChange={(e) => inp('name', e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address <span className="text-red-400">*</span></label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  id="signup-email"
                  value={form.email}
                  onChange={(e) => inp('email', e.target.value)}
                  placeholder="alex@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Occupation (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Briefcase size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="signup-occupation"
                  value={form.occupation}
                  onChange={(e) => inp('occupation', e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  id="signup-password"
                  value={form.password}
                  onChange={(e) => inp('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength >= 3 ? 'text-emerald-600' : strength >= 2 ? 'text-blue-500' : 'text-amber-500'}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  id="signup-confirm"
                  value={form.confirm}
                  onChange={(e) => inp('confirm', e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              id="signup-submit"
              className="w-full py-3 px-4 gradient-emerald text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Creating account...</>
              ) : (
                <><span>Create Free Account</span><ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button onClick={goToLogin} className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
