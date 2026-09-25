import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Search, Filter, X, Loader2, Receipt,
  ChevronDown, ArrowUpDown, AlertCircle, CheckCircle2
} from 'lucide-react';
import { expenseAPI, financeAPI } from '../api/services';
import { Toast, useToast } from '../components/Toast';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';

const CATEGORIES = [
  'All', 'Housing', 'Food & Dining', 'Transportation', 'Utilities',
  'Healthcare', 'Entertainment', 'Shopping', 'Debt Payment', 'Education', 'Personal Care', 'Other'
];

const CAT_ICONS = {
  Housing: '🏠', 'Food & Dining': '🍽️', Transportation: '🚗',
  Utilities: '💡', Healthcare: '💊', Entertainment: '🎬',
  Shopping: '🛍️', 'Debt Payment': '💳', Education: '📚',
  'Personal Care': '💆', Other: '📦'
};

const COLORS = [
  '#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1','#14b8a6'
];

const fmt = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EMPTY_FORM = { title: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], notes: '', isRecurring: false };

const BudgetExpenses = () => {
  const { toast, showToast, closeToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ category: 'All', search: '' });
  const [catBreakdown, setCatBreakdown] = useState([]);
  const [budgetInfo, setBudgetInfo] = useState({ budgetLimit: 0, totalExpenses: 0 });
  const [deleting, setDeleting] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category !== 'All') params.category = filter.category;
      if (filter.search) params.search = filter.search;
      const [expRes, finRes] = await Promise.all([
        expenseAPI.getExpenses({ ...params, limit: 100 }),
        financeAPI.getProfile(),
      ]);
      setExpenses(expRes.data.expenses || []);
      setTotalAmount(expRes.data.totalAmount || 0);
      setCatBreakdown(finRes.data.categoryBreakdown || []);
      setBudgetInfo({
        budgetLimit: finRes.data.profile?.budgetLimit || 0,
        totalExpenses: finRes.data.summary?.totalExpenses || 0,
      });
    } catch {
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filter.category]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchExpenses();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) { showToast('Title and amount are required', 'warning'); return; }
    if (Number(form.amount) <= 0) { showToast('Amount must be greater than 0', 'warning'); return; }
    setSubmitting(true);
    try {
      await expenseAPI.createExpense({ ...form, amount: Number(form.amount) });
      showToast('Expense added successfully!', 'success');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchExpenses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add expense', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await expenseAPI.deleteExpense(id);
      showToast('Expense deleted', 'success');
      fetchExpenses();
    } catch { showToast('Failed to delete expense', 'error'); }
    finally { setDeleting(null); }
  };

  const budgetPct = budgetInfo.budgetLimit > 0 ? Math.min(100, (budgetInfo.totalExpenses / budgetInfo.budgetLimit) * 100) : 0;
  const isOverBudget = budgetInfo.totalExpenses > budgetInfo.budgetLimit && budgetInfo.budgetLimit > 0;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Budget & Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage your spending</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl shadow-sm hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Budget status bar */}
      {budgetInfo.budgetLimit > 0 && (
        <div className={`p-4 rounded-2xl border ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'} shadow-card`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isOverBudget ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
              <span className="text-sm font-semibold text-slate-700">Monthly Budget</span>
            </div>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              ${budgetInfo.totalExpenses.toLocaleString()} / ${budgetInfo.budgetLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${isOverBudget ? 'bg-red-500' : budgetPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, budgetPct)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {isOverBudget
              ? `$${(budgetInfo.totalExpenses - budgetInfo.budgetLimit).toLocaleString()} over budget`
              : `$${(budgetInfo.budgetLimit - budgetInfo.totalExpenses).toLocaleString()} remaining`}
          </p>
        </div>
      )}

      {/* Charts + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card lg:col-span-1">
          <h3 className="font-semibold text-slate-700 mb-4">By Category</h3>
          {catBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={catBreakdown} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="amount">
                    {catBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {catBreakdown.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 truncate max-w-[100px]">{cat.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{fmt(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Receipt size={28} className="mb-2 opacity-40" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </div>

        {/* Expenses list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filter.search}
                onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value }))}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter.category}
              onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Total */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
            <span className="text-sm font-bold text-slate-800">Total: {fmt(totalAmount)}</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[420px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={22} className="animate-spin text-emerald-500" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Receipt size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No expenses found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {expenses.map((exp) => (
                  <div key={exp._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                      {CAT_ICONS[exp.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{exp.title}</p>
                      <p className="text-xs text-slate-400">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 flex-shrink-0">{fmt(exp.amount)}</span>
                    <button
                      onClick={() => handleDelete(exp._id)}
                      disabled={deleting === exp._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                    >
                      {deleting === exp._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Expense</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Grocery shopping"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm((p) => ({ ...p, isRecurring: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-sm text-slate-600">Recurring monthly expense</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 gradient-emerald text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetExpenses;
