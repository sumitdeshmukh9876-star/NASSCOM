import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, X, Loader2, Target, CheckCircle2,
  Calendar, TrendingUp, DollarSign, Trophy, PiggyBank
} from 'lucide-react';
import { goalAPI } from '../api/services';
import { Toast, useToast } from '../components/Toast';

const GOAL_CATEGORIES = [
  'Emergency Fund', 'Retirement', 'Home Purchase', 'Debt Freedom',
  'Vacation & Travel', 'Vehicle', 'Education', 'Investment', 'Other'
];
const CAT_ICONS = {
  'Emergency Fund': '🛡️', Retirement: '👴', 'Home Purchase': '🏠',
  'Debt Freedom': '💳', 'Vacation & Travel': '✈️', Vehicle: '🚗',
  Education: '📚', Investment: '📈', Other: '🎯'
};
const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_COLORS = { High: 'text-red-600 bg-red-50', Medium: 'text-amber-600 bg-amber-50', Low: 'text-blue-600 bg-blue-50' };

const fmt = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const EMPTY_FORM = {
  title: '', targetAmount: '', currentAmount: '', category: 'Emergency Fund',
  targetDate: '', monthlyContribution: '', priority: 'Medium'
};

const FinancialGoals = () => {
  const { toast, showToast, closeToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [fundGoal, setFundGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [stats, setStats] = useState({});

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalAPI.getGoals();
      setGoals(res.data.goals || []);
      setStats({
        count: res.data.count,
        completedCount: res.data.completedCount,
        totalTarget: res.data.totalTarget,
        totalSaved: res.data.totalSaved,
      });
    } catch { showToast('Failed to load goals', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditGoal(null); setShowForm(true); };
  const openEdit = (goal) => {
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      category: goal.category,
      targetDate: goal.targetDate?.split('T')[0] || '',
      monthlyContribution: goal.monthlyContribution || '',
      priority: goal.priority,
    });
    setEditGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount || !form.targetDate) { showToast('Title, target amount and date are required', 'warning'); return; }
    setSubmitting(true);
    try {
      if (editGoal) {
        await goalAPI.updateGoal(editGoal._id, { ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount || 0), monthlyContribution: Number(form.monthlyContribution || 0) });
        showToast('Goal updated successfully!', 'success');
      } else {
        await goalAPI.createGoal({ ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount || 0), monthlyContribution: Number(form.monthlyContribution || 0) });
        showToast('Goal created!', 'success');
      }
      setShowForm(false);
      fetchGoals();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save goal', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await goalAPI.deleteGoal(id);
      showToast('Goal deleted', 'success');
      fetchGoals();
    } catch { showToast('Failed to delete goal', 'error'); }
    finally { setDeleting(null); }
  };

  const handleAddFunds = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) { showToast('Enter a valid amount', 'warning'); return; }
    setAddingFunds(true);
    try {
      await goalAPI.updateGoal(fundGoal._id, { addFunds: Number(fundAmount) });
      showToast(`$${Number(fundAmount).toLocaleString()} added to "${fundGoal.title}"!`, 'success');
      setFundGoal(null); setFundAmount('');
      fetchGoals();
    } catch { showToast('Failed to add funds', 'error'); }
    finally { setAddingFunds(false); }
  };

  const inp = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const totalOverallPct = stats.totalTarget > 0 ? Math.round((stats.totalSaved / stats.totalTarget) * 100) : 0;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Goals</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your milestones toward financial freedom</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl shadow-sm hover:opacity-90 transition-all">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: stats.count || 0, icon: Target, color: 'bg-blue-500' },
          { label: 'Completed', value: stats.completedCount || 0, icon: CheckCircle2, color: 'bg-emerald-500' },
          { label: 'Total Target', value: fmt(stats.totalTarget), icon: DollarSign, color: 'bg-purple-500' },
          { label: 'Total Saved', value: fmt(stats.totalSaved), icon: PiggyBank, color: 'bg-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="text-xl font-bold text-slate-800 mb-0.5">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <span className="font-semibold">Overall Progress</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">{totalOverallPct}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div className="h-3 rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${totalOverallPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>{fmt(stats.totalSaved)} saved</span>
            <span>{fmt(stats.totalTarget)} target</span>
          </div>
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Target size={52} className="mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-slate-500 mb-2">No goals yet</h3>
          <p className="text-sm mb-4">Create your first financial milestone to start tracking progress</p>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl">
            <Plus size={15} /> Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const daysLeft = goal.targetDate ? Math.max(0, Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000)) : null;
            return (
              <div key={goal._id} className={`bg-white rounded-2xl p-5 border shadow-card hover:shadow-card-hover transition-all duration-300 ${goal.isCompleted ? 'border-emerald-200' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${goal.isCompleted ? 'bg-emerald-100' : 'bg-slate-100'} flex items-center justify-center text-xl`}>
                      {CAT_ICONS[goal.category] || '🎯'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{goal.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[goal.priority] || ''}`}>{goal.priority}</span>
                        {goal.isCompleted && <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Done</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(goal._id)} disabled={deleting === goal._id} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      {deleting === goal._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{fmt(goal.currentAmount)}</span>
                    <span className="font-bold text-slate-700">{pct}%</span>
                    <span>{fmt(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${goal.isCompleted ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  {daysLeft !== null && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}</span>
                    </div>
                  )}
                  {goal.monthlyContribution > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>{fmt(goal.monthlyContribution)}/mo</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setFundGoal(goal); setFundAmount(''); }}
                  className="w-full py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  + Add Funds
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">{editGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Goal Title *</label>
                <input type="text" value={form.title} onChange={(e) => inp('title', e.target.value)} placeholder="e.g. Emergency Fund" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Amount ($) *</label>
                  <input type="number" min="1" value={form.targetAmount} onChange={(e) => inp('targetAmount', e.target.value)} placeholder="10000" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Saved ($)</label>
                  <input type="number" min="0" value={form.currentAmount} onChange={(e) => inp('currentAmount', e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => inp('category', e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    {GOAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => inp('priority', e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Date *</label>
                  <input type="date" value={form.targetDate} onChange={(e) => inp('targetDate', e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Contribution ($)</label>
                  <input type="number" min="0" value={form.monthlyContribution} onChange={(e) => inp('monthlyContribution', e.target.value)} placeholder="500" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {editGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add Funds</h3>
              <button onClick={() => setFundGoal(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Adding to: <span className="font-semibold text-slate-700">{fundGoal.title}</span></p>
            <p className="text-sm text-slate-500 mb-4">Current: {fmt(fundGoal.currentAmount)} / {fmt(fundGoal.targetAmount)}</p>
            <input
              type="number"
              min="1"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Amount to deposit ($)"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setFundGoal(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddFunds} disabled={addingFunds} className="flex-1 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70">
                {addingFunds ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;
