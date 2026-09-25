import { useState, useEffect } from 'react';
import {
  BrainCircuit, Send, Loader2, AlertCircle, Info, ChevronDown,
  ChevronUp, DollarSign, TrendingUp, PiggyBank, CreditCard, Sparkles,
  Target, Activity, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { aiAPI, financeAPI } from '../api/services';
import { Toast, useToast } from '../components/Toast';

const RISK_OPTIONS = ['Conservative', 'Moderate', 'Aggressive'];

const SectionAccordion = ({ title, icon: Icon, iconBg, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={17} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
};

const AIAdvisor = () => {
  const { toast, showToast, closeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [formData, setFormData] = useState({
    monthlyIncome: '', currentSavings: '', totalDebt: '',
    monthlySavingsTarget: '', riskPreference: 'Moderate', budgetLimit: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Prefill form from saved profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await financeAPI.getProfile();
        const p = res.data.profile || {};
        setFormData({
          monthlyIncome: p.monthlyIncome || '',
          currentSavings: p.currentSavings || '',
          totalDebt: p.totalDebt || '',
          monthlySavingsTarget: p.monthlySavingsTarget || '',
          riskPreference: p.riskPreference || 'Moderate',
          budgetLimit: p.budgetLimit || '',
        });
      } catch {/* ignore */}
      finally { setLoadingProfile(false); }
    };
    loadProfile();
  }, []);

  const handleAsk = async () => {
    if (!formData.monthlyIncome) { showToast('Please enter your monthly income first', 'warning'); return; }
    setLoading(true);
    setAdvice(null);
    try {
      const res = await aiAPI.getAdvice(formData);
      setAdvice(res.data);
      showToast('AI analysis complete!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'AI request failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  const inp = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const a = advice?.advice;
  const scoreColor = !a ? '' : a.financialHealthScore >= 75 ? 'text-emerald-600' : a.financialHealthScore >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = !a ? '' : a.financialHealthScore >= 75 ? 'bg-emerald-500' : a.financialHealthScore >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg flex-shrink-0">
          <BrainCircuit size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Financial Advisor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Enter your financial data and receive personalized AI-powered recommendations</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Educational Disclaimer:</span> AI-generated financial advice is for educational and informational purposes only.
          It is not professional financial, tax, or investment advice. Please consult a certified financial advisor for personalized guidance.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-5">Your Financial Profile</h2>
        {loadingProfile ? (
          <div className="flex items-center gap-3 text-slate-400 py-6">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
            <span className="text-sm">Loading your saved profile...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { key: 'monthlyIncome', label: 'Monthly Income ($)', icon: DollarSign, placeholder: '6500' },
              { key: 'currentSavings', label: 'Current Savings ($)', icon: PiggyBank, placeholder: '14200' },
              { key: 'totalDebt', label: 'Total Debt ($)', icon: CreditCard, placeholder: '8500' },
              { key: 'monthlySavingsTarget', label: 'Monthly Savings Target ($)', icon: Target, placeholder: '1500' },
              { key: 'budgetLimit', label: 'Monthly Budget Limit ($)', icon: TrendingUp, placeholder: '4200' },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    value={formData[key]}
                    onChange={(e) => inp(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Risk preference */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Risk Preference</label>
              <div className="flex gap-2">
                {RISK_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => inp('riskPreference', r)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${formData.riskPreference === r ? 'gradient-emerald text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAsk}
          disabled={loading || loadingProfile}
          id="ask-ai-btn"
          className="w-full py-3.5 gradient-emerald text-white font-bold rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing your finances...</>
          ) : (
            <><Sparkles size={18} /> Ask AI Advisor</>
          )}
        </button>
      </div>

      {/* AI Response */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-slate-200 border-b-transparent animate-spin animate-[spin_1.5s_linear_infinite_reverse]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700">AI is analyzing your financial data...</p>
            <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
          </div>
        </div>
      )}

      {a && !loading && (
        <div className="space-y-4">
          {/* Health Score Banner */}
          <div className={`rounded-2xl p-6 text-white ${a.isSpendingOverIncome ? 'bg-gradient-to-r from-red-700 to-red-900' : 'bg-gradient-to-r from-slate-800 to-emerald-900'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <span className={`text-3xl font-black ${scoreColor.replace('text-', 'text-white')}`}>{a.financialHealthScore}</span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 ${scoreBg} rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white`}>
                  {a.financialHealthScore >= 75 ? '★' : a.financialHealthScore >= 50 ? '~' : '!'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {a.isSpendingOverIncome && <ShieldAlert size={18} className="text-red-300" />}
                  <h3 className="text-lg font-bold">Financial Health: <span className="text-emerald-300">{a.financialHealthGrade}</span></h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{a.summary}</p>
              </div>
            </div>
          </div>

          {/* Spending Analysis */}
          <SectionAccordion title="2. Spending Analysis" icon={Activity} iconBg="bg-blue-500" defaultOpen>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">{a.spendingAnalysis?.summary}</p>
              {a.spendingAnalysis?.highSpendingCategories?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">High Spending Areas</p>
                  <ul className="space-y-1.5">
                    {a.spendingAnalysis.highSpendingCategories.map((cat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-amber-500 flex-shrink-0 mt-0.5">▸</span> {cat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-800">{a.spendingAnalysis?.unnecessaryOrDiscretionarySpending}</p>
              </div>
            </div>
          </SectionAccordion>

          {/* Recommended Budget */}
          <SectionAccordion title="3. Recommended Budget" icon={DollarSign} iconBg="bg-emerald-500" defaultOpen>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Needs (50%)', data: a.recommendedBudget?.needs, color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500' },
                  { label: 'Wants (30%)', data: a.recommendedBudget?.wants, color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-500' },
                  { label: 'Savings & Debt (20%)', data: a.recommendedBudget?.savingsAndDebt, color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500' },
                ].map(({ label, data, color, badge }) => data && (
                  <div key={label} className={`p-3.5 rounded-xl border ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${badge}`} />
                      <span className="text-xs font-bold text-slate-700">{label}</span>
                    </div>
                    <p className="text-xl font-black text-slate-800 mb-1">${(data.amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{data.description}</p>
                  </div>
                ))}
              </div>
              {a.recommendedBudget?.potentialMonthlySavings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">
                    <span className="font-bold">Potential monthly savings: ${a.recommendedBudget.potentialMonthlySavings.toLocaleString()}</span>
                    {a.recommendedBudget.notes && ` — ${a.recommendedBudget.notes}`}
                  </p>
                </div>
              )}
            </div>
          </SectionAccordion>

          {/* Savings Plan */}
          <SectionAccordion title="4. Savings Plan" icon={PiggyBank} iconBg="bg-cyan-500" defaultOpen>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Emergency Fund Target', value: `$${(a.savingsPlan?.emergencyFundTarget || 0).toLocaleString()}` },
                  { label: 'Covers (months)', value: `${a.savingsPlan?.emergencyFundMonths || 6}` },
                  { label: 'Currently Saved', value: `$${(a.savingsPlan?.emergencyFundCurrent || 0).toLocaleString()}` },
                  { label: 'Months to Complete', value: a.savingsPlan?.monthsToCompleteEmergencyFund > 0 ? `~${a.savingsPlan.monthsToCompleteEmergencyFund} mo` : '✓ Funded' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-800">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
              {a.savingsPlan?.stepByStepPlan?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Action Steps</p>
                  {a.savingsPlan.stepByStepPlan.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.step}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{step.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Target: {step.target} · {step.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionAccordion>

          {/* Debt Suggestions */}
          {a.debtSuggestions && (
            <SectionAccordion title="5. Debt Strategy" icon={CreditCard} iconBg="bg-rose-500" defaultOpen>
              <div className="space-y-3">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                  <p className="text-sm font-semibold text-rose-800 mb-1">Strategy</p>
                  <p className="text-sm text-rose-700">{a.debtSuggestions.strategy}</p>
                </div>
                {a.debtSuggestions.monthlyAllocation > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-800">${a.debtSuggestions.monthlyAllocation.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Monthly Payoff Allocation</p>
                    </div>
                    {a.debtSuggestions.estimatedPayoffMonths > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-slate-800">~{a.debtSuggestions.estimatedPayoffMonths} mo</p>
                        <p className="text-xs text-slate-500">Estimated Payoff Timeline</p>
                      </div>
                    )}
                  </div>
                )}
                {a.debtSuggestions.recommendations?.length > 0 && (
                  <ul className="space-y-2">
                    {a.debtSuggestions.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionAccordion>
          )}

          {/* Goal Progress */}
          {a.goalProgress && (
            <SectionAccordion title="6. Goal Progress" icon={Target} iconBg="bg-violet-500">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 mb-3">{a.goalProgress.overallStatus}</p>
                {a.goalProgress.insights?.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600 p-2.5 rounded-lg bg-slate-50">
                    <Target size={14} className="text-violet-500 flex-shrink-0 mt-0.5" /> {insight}
                  </div>
                ))}
              </div>
            </SectionAccordion>
          )}

          {/* Action Steps */}
          {a.actionSteps?.length > 0 && (
            <SectionAccordion title="7. Personalized Action Steps" icon={Sparkles} iconBg="bg-amber-500" defaultOpen>
              <div className="space-y-3">
                {a.actionSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-card transition-all">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-slate-800">{step.title}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.priority === 'High' ? 'bg-red-100 text-red-700' : step.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {step.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-1">{step.description}</p>
                      <p className="text-xs font-semibold text-emerald-600">Impact: {step.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionAccordion>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-100 rounded-2xl p-4 text-xs text-slate-500 text-center leading-relaxed">
            <span className="font-semibold">⚠️ Disclaimer:</span> {a.disclaimer || 'AI output is educational only and not professional financial advice.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
