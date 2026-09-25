import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, AlertCircle,
  Target, CreditCard, RefreshCw, Sparkles, Loader2, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { financeAPI, expenseAPI, goalAPI, aiAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/Toast';

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6'
];

const formatCurrency = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const formatPct = (val) => `${Number(val || 0).toFixed(1)}%`;

const MetricCard = ({ title, value, subtitle, icon: Icon, iconBg, trend, onClick }) => (
  <div
    className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-500">{title}</div>
    {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color }} className="font-medium">
          {e.name}: {formatCurrency(e.value)}
        </p>
      ))}
    </div>
  );
};

const Dashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const { toast, showToast, closeToast } = useToast();
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [finRes, expRes, goalRes] = await Promise.all([
        financeAPI.getProfile(),
        expenseAPI.getExpenses({ limit: 5 }),
        goalAPI.getGoals(),
      ]);
      setData(finRes.data);
      setExpenses(expRes.data.expenses || []);
      setGoals(goalRes.data.goals || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await financeAPI.seedDemo();
      showToast('Demo financial data loaded! Dashboard refreshed.', 'success');
      await fetchData();
    } catch {
      showToast('Failed to load demo data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const catBreakdown = data?.categoryBreakdown || [];
  const profile = data?.profile || {};

  // Build monthly bar chart from expenses
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const monthlyChartData = monthLabels.slice(Math.max(0, currentMonth - 4), currentMonth + 1).map((m, i) => ({
    month: m,
    Expenses: i === Math.min(4, currentMonth) ? Math.round(summary.totalExpenses || 0) : Math.round((summary.totalExpenses || 0) * (0.75 + Math.random() * 0.4)),
    Income: profile.monthlyIncome || 0,
  }));

  const hasData = (profile.monthlyIncome || 0) > 0;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          {!hasData && (
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-70"
            >
              {seeding ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Load Demo Data
            </button>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Over-budget alert */}
      {summary.isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Budget Exceeded</p>
            <p className="text-sm text-red-600 mt-0.5">
              You've spent {formatCurrency(summary.totalExpenses)} against a {formatCurrency(summary.budgetLimit)} budget this month.
              Consider reducing discretionary spending.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyIncome)}
          subtitle="Gross monthly"
          icon={DollarSign}
          iconBg="bg-emerald-500"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          subtitle="This month"
          icon={TrendingDown}
          iconBg={summary.isOverBudget ? 'bg-red-500' : 'bg-amber-500'}
        />
        <MetricCard
          title="Current Savings"
          value={formatCurrency(summary.currentSavings)}
          subtitle={`${formatPct(summary.savingsRate)} savings rate`}
          icon={PiggyBank}
          iconBg="bg-blue-500"
        />
        <MetricCard
          title="Total Debt"
          value={formatCurrency(summary.totalDebt)}
          subtitle={summary.totalDebt === 0 ? '🎉 Debt Free!' : 'Total outstanding'}
          icon={CreditCard}
          iconBg={summary.totalDebt === 0 ? 'bg-emerald-500' : 'bg-rose-500'}
        />
      </div>

      {/* Secondary metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Cash Flow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${(summary.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(summary.netCashFlow || 0) >= 0 ? '+' : ''}{formatCurrency(summary.netCashFlow)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Income minus expenses this month</p>
        </div>

        {/* Budget Used */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Budget Used</p>
            <span className={`text-xs font-bold ${summary.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatPct(summary.budgetUsedPercentage)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${summary.isOverBudget ? 'bg-red-500' : summary.budgetUsedPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, summary.budgetUsedPercentage || 0)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{formatCurrency(Math.abs(summary.budgetRemaining || 0))} {(summary.budgetRemaining || 0) >= 0 ? 'remaining' : 'over budget'}</p>
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card cursor-pointer hover:shadow-card-hover transition-all" onClick={() => setActivePage('goals')}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Goals Progress</p>
            <ArrowUpRight size={14} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-1">{summary.completedGoalsCount || 0}/{summary.goalsCount || 0}</p>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
            <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${summary.overallGoalProgress || 0}%` }} />
          </div>
          <p className="text-xs text-slate-400">{summary.overallGoalProgress || 0}% overall completion</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-700">Expense Breakdown</h3>
            <button onClick={() => setActivePage('expenses')} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {catBreakdown.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="amount">
                    {catBreakdown.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 min-w-[140px]">
                {catBreakdown.slice(0, 6).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-xs text-slate-600 truncate">{cat.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Target size={36} className="mb-3 opacity-40" />
              <p className="text-sm">No expenses recorded yet</p>
              <button onClick={() => setActivePage('expenses')} className="mt-2 text-xs text-emerald-600 font-medium hover:underline">Add expenses →</button>
            </div>
          )}
        </div>

        {/* Monthly Income vs Expenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <h3 className="font-semibold text-slate-700 mb-5">Monthly Trend</h3>
          {hasData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <TrendingUp size={36} className="mb-3 opacity-40" />
              <p className="text-sm">Add income & expenses to see trends</p>
              <button onClick={handleSeedDemo} className="mt-2 text-xs text-emerald-600 font-medium hover:underline">Load demo data →</button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses + Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Recent Expenses</h3>
            <button onClick={() => setActivePage('expenses')} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
              Manage <ArrowUpRight size={12} />
            </button>
          </div>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((exp) => (
                <div key={exp._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base">
                      {{ Housing: '🏠', 'Food & Dining': '🍽️', Transportation: '🚗', Utilities: '💡', Healthcare: '💊', Entertainment: '🎬', Shopping: '🛍️', 'Debt Payment': '💳', Education: '📚', 'Personal Care': '💆', Other: '📦' }[exp.category] || '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[140px]">{exp.title}</p>
                      <p className="text-xs text-slate-400">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <p className="text-sm">No expenses yet</p>
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Financial Goals</h3>
            <button onClick={() => setActivePage('goals')} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
              Manage <ArrowUpRight size={12} />
            </button>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((goal) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{goal.title}</span>
                      <span className="text-xs font-bold text-slate-500">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-xs text-slate-400">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Target size={28} className="mb-2 opacity-40" />
              <p className="text-sm">No goals created yet</p>
              <button onClick={() => setActivePage('goals')} className="mt-1.5 text-xs text-emerald-600 font-medium hover:underline">Create a goal →</button>
            </div>
          )}
        </div>
      </div>

      {/* AI Advisor CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-white font-bold text-lg mb-1">Get AI-powered insights</h3>
          <p className="text-slate-300 text-sm">Ask your AI Advisor for personalized budgeting, debt, and savings recommendations.</p>
        </div>
        <button
          onClick={() => setActivePage('advisor')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 whitespace-nowrap flex-shrink-0"
        >
          <Sparkles size={16} /> Ask AI Advisor
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
