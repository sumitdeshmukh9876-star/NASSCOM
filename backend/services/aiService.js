import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * High-precision financial calculation engine
 * Used when no AI key is provided or as guaranteed fallback
 */
function generateDeterministicFinancialAdvice(data) {
  const {
    monthlyIncome = 0,
    totalExpenses = 0,
    currentSavings = 0,
    totalDebt = 0,
    monthlySavingsTarget = 0,
    riskPreference = 'Moderate',
    expenses = [],
    goals = [],
    categoryBreakdown = [],
  } = data;

  const netCashFlow = monthlyIncome - totalExpenses;
  const isSpendingOverIncome = totalExpenses > monthlyIncome;
  const savingsRate = monthlyIncome > 0 ? (Math.max(0, netCashFlow) / monthlyIncome) * 100 : 0;

  // 1. Financial Health Score (0 - 100)
  let score = 50;
  if (monthlyIncome > 0) {
    if (netCashFlow > 0) score += 20;
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 10;
  }
  if (totalDebt === 0) score += 15;
  else if (totalDebt < monthlyIncome * 2) score += 5;
  else score -= 10;

  const targetEmergencyFund = totalExpenses > 0 ? totalExpenses * 6 : monthlyIncome * 4;
  if (currentSavings >= targetEmergencyFund) score += 15;
  else if (currentSavings >= targetEmergencyFund * 0.5) score += 10;
  else if (currentSavings > 0) score += 5;

  score = Math.min(100, Math.max(15, Math.round(score)));

  let healthGrade = 'Fair';
  if (score >= 80) healthGrade = 'Excellent';
  else if (score >= 65) healthGrade = 'Good';
  else if (score >= 45) healthGrade = 'Fair';
  else healthGrade = 'Needs Attention';

  // 2. Spending Analysis
  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
  const highCategories = sortedCategories.slice(0, 3).map((c) => `${c.name} (${c.percentage}% of total spending, $${c.amount.toFixed(2)})`);
  
  const discretionaryCategories = ['Entertainment', 'Shopping', 'Food & Dining'];
  const discretionaryTotal = expenses
    .filter((e) => discretionaryCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const potentialMonthlySavings = Math.round(discretionaryTotal * 0.25 + Math.max(0, netCashFlow * 0.1));

  // 3. Recommended 50/30/20 Budget
  const recommendedNeeds = Math.round(monthlyIncome * 0.50);
  const recommendedWants = Math.round(monthlyIncome * 0.30);
  const recommendedSavingsDebt = Math.round(monthlyIncome * 0.20);

  // 4. Emergency Fund & Savings Plan
  const emergencyGap = Math.max(0, targetEmergencyFund - currentSavings);
  const monthlyContributionSuggested = monthlySavingsTarget > 0 ? monthlySavingsTarget : Math.max(200, Math.round(netCashFlow * 0.6));
  const monthsToEmergencyFund = monthlyContributionSuggested > 0 ? Math.ceil(emergencyGap / monthlyContributionSuggested) : 0;

  // 5. Debt Suggestions
  const debtStrategy = totalDebt > 0
    ? totalDebt > monthlyIncome * 3
      ? 'Avalanche Method (Focus on highest APR interest debts first while maintaining minimum payments on others)'
      : 'Snowball Method (Pay off smallest debt balances first for fast psychological momentum and cash flow freeing)'
    : 'Debt Free! Direct all former debt payment allocations directly into compounding retirement & index funds.';

  const debtPayoffMonths = totalDebt > 0 ? Math.ceil(totalDebt / Math.max(100, Math.round(monthlyIncome * 0.15))) : 0;

  // 6. Goal Progress
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallGoalProgress = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0;

  return {
    financialHealthScore: score,
    financialHealthGrade: healthGrade,
    isSpendingOverIncome,
    summary: isSpendingOverIncome
      ? `CRITICAL ALERT: Your monthly expenses ($${totalExpenses.toLocaleString()}) exceed your income ($${monthlyIncome.toLocaleString()}) by $${Math.abs(netCashFlow).toLocaleString()}. Urgent spending adjustments are recommended to prevent debt accumulation.`
      : `Your finances are in ${healthGrade.toLowerCase()} condition with a healthy ${savingsRate.toFixed(1)}% savings rate. You retain a net surplus of $${netCashFlow.toLocaleString()} every month that can be strategically allocated between emergency savings, debt payoff, and investment goals according to your ${riskPreference.toLowerCase()} risk profile.`,
    spendingAnalysis: {
      summary: `Your top expense areas are ${sortedCategories.slice(0, 2).map((c) => c.name).join(' and ') || 'general essentials'}. Discretionary expenditures account for $${discretionaryTotal.toLocaleString()} of total outflows.`,
      highSpendingCategories: highCategories.length ? highCategories : ['Essential housing & living costs'],
      unnecessaryOrDiscretionarySpending: `Auditing subscription renewals, dining out, and impulse shopping could recover approximately $${potentialMonthlySavings.toLocaleString()} per month in free cash flow.`,
    },
    recommendedBudget: {
      needs: {
        amount: recommendedNeeds,
        percentage: 50,
        description: 'Housing, utilities, groceries, transit, minimum debt requirements, essential healthcare.',
      },
      wants: {
        amount: recommendedWants,
        percentage: 30,
        description: 'Dining out, entertainment, shopping, hobby gear, streaming subscriptions.',
      },
      savingsAndDebt: {
        amount: recommendedSavingsDebt,
        percentage: 20,
        description: 'Emergency fund deposits, accelerated debt principal payments, long-term index investments.',
      },
      potentialMonthlySavings,
      notes: isSpendingOverIncome
        ? 'Reduce discretionary categories immediately by at least 30% to bring total outflows below income threshold.'
        : `Consistently allocating $${recommendedSavingsDebt.toLocaleString()} (20% of your earnings) will yield $${(recommendedSavingsDebt * 12).toLocaleString()} in new wealth annually.`,
    },
    savingsPlan: {
      emergencyFundTarget: Math.round(targetEmergencyFund),
      emergencyFundMonths: 6,
      emergencyFundCurrent: currentSavings,
      monthsToCompleteEmergencyFund: monthsToEmergencyFund,
      stepByStepPlan: [
        {
          step: 1,
          action: 'Establish Base Liquidity Buffer',
          target: `$${Math.min(currentSavings + 1000, Math.round(targetEmergencyFund * 0.3)).toLocaleString()}`,
          timeline: '1-2 Months',
        },
        {
          step: 2,
          action: 'Optimize High-Yield Savings Account (HYSA)',
          target: 'Move emergency liquid reserves to 4.5%+ APY account',
          timeline: 'Immediate',
        },
        {
          step: 3,
          action: 'Full 6-Month Essential Expense Reserve',
          target: `$${Math.round(targetEmergencyFund).toLocaleString()}`,
          timeline: monthsToEmergencyFund > 0 ? `Target ${monthsToEmergencyFund} Months` : 'Fully Funded',
        },
      ],
    },
    debtSuggestions: {
      strategy: debtStrategy,
      monthlyAllocation: totalDebt > 0 ? Math.round(monthlyIncome * 0.15) : 0,
      estimatedPayoffMonths: debtPayoffMonths,
      recommendations: totalDebt > 0
        ? [
            'Avoid adding new balance to high-interest credit cards while in active repayment.',
            `Allocate a dedicated $${Math.round(monthlyIncome * 0.15).toLocaleString()} monthly payment directly towards your highest APR debt.`,
            'Explore 0% APR balance transfer cards or personal consolidation loans if card APR exceeds 18%.',
          ]
        : ['Maintain zero revolving high-interest debt and pay credit card statements in full each billing cycle.'],
    },
    goalProgress: {
      overallStatus: `${overallGoalProgress}% completed across ${goals.length} tracked financial goals.`,
      insights: goals.length
        ? goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
            return `"${g.title}": ${pct}% reached ($${g.currentAmount.toLocaleString()} of $${g.targetAmount.toLocaleString()}).`;
          })
        : ['Create targeted milestones such as Emergency Fund, Home Purchase, or Travel Fund to track your wealth trajectory.'],
    },
    actionSteps: [
      {
        title: isSpendingOverIncome ? 'Halt Discretionary Outflows' : 'Automate Pay-Yourself-First Transfer',
        description: isSpendingOverIncome
          ? 'Institute a 14-day spending freeze on non-essential dining and shopping to restore positive cash flow.'
          : `Set up an automated transfer of $${Math.max(200, potentialMonthlySavings).toLocaleString()} to your high-yield savings immediately after your monthly income deposit.`,
        priority: 'High',
        impact: `Protects $${Math.max(200, potentialMonthlySavings).toLocaleString()}/month`,
      },
      {
        title: totalDebt > 0 ? 'Implement Accelerated Debt Payoff' : 'Maximize Retirement & Index Compounding',
        description: totalDebt > 0
          ? `Direct an additional $${Math.round(potentialMonthlySavings * 0.5).toLocaleString()}/month to accelerate payoff of your $${totalDebt.toLocaleString()} total debt.`
          : `Deploy surplus capital into low-cost broad market index funds aligned with your ${riskPreference.toLowerCase()} risk profile.`,
        priority: totalDebt > 0 ? 'High' : 'Medium',
        impact: totalDebt > 0 ? `Reduces debt duration by ~${Math.max(2, Math.round(debtPayoffMonths * 0.3))} months` : 'Compounds long-term wealth',
      },
      {
        title: 'Review Recurring Subscriptions and Utilities',
        description: 'Conduct a line-by-line audit of auto-renewing subscriptions, internet/mobile bills, and insurance premiums to negotiate lower rates.',
        priority: 'Medium',
        impact: 'Saves estimated $40 - $120 monthly',
      },
    ],
    disclaimer: 'Educational Disclaimer: This AI-generated financial report is generated strictly for educational, informational, and personal planning guidance. It does not constitute certified legal, tax, or fiduciary investment advice. Please consult a licensed professional for individualized financial planning.',
  };
}

/**
 * Main AI Advisor function
 * Uses Gemini API if GEMINI_API_KEY is configured, else falls back smoothly to deterministic engine
 */
export async function generateAIFinancialAdvice(userData) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('[AI Advisor] No Gemini API key provided. Using built-in financial analysis engine.');
    return generateDeterministicFinancialAdvice(userData);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `
You are a top-tier certified Personal Financial Advisor AI.
Analyze the following user financial data carefully:

USER FINANCIAL DATA:
- Monthly Income: $${userData.monthlyIncome}
- Total Monthly Expenses: $${userData.totalExpenses}
- Current Savings: $${userData.currentSavings}
- Total Debt: $${userData.totalDebt}
- Monthly Savings Target: $${userData.monthlySavingsTarget}
- Risk Preference: ${userData.riskPreference}
- Budget Limit: $${userData.budgetLimit || 'Not set'}
- Categories Breakdown: ${JSON.stringify(userData.categoryBreakdown || [])}
- Goals: ${JSON.stringify(userData.goals || [])}
- Recent Expenses: ${JSON.stringify(userData.expenses || [])}

MANDATORY RULES:
1. Analyze spending patterns and identify unnecessary/high spending categories.
2. Suggest a realistic monthly budget (e.g. 50/30/20 rule adjusted for their profile).
3. Calculate potential monthly savings realistically.
4. Recommend an emergency-fund target (typically 3-6 months of expenses).
5. Suggest debt repayment strategies (Avalanche vs Snowball) if debt exists.
6. Create a step-by-step savings plan.
7. Provide clear warnings if spending exceeds income (${userData.totalExpenses > userData.monthlyIncome ? 'WARNING: SPENDING EXCEEDS INCOME' : 'Cash flow is positive'}).
8. Never invent financial information not supported by the data.
9. Explain recommendations in simple, inspiring language.
10. Include the mandatory educational disclaimer.

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "financialHealthScore": number (0-100),
  "financialHealthGrade": string ("Excellent" | "Good" | "Fair" | "Needs Attention"),
  "isSpendingOverIncome": boolean,
  "summary": string (1. Financial Health Summary),
  "spendingAnalysis": {
    "summary": string (2. Spending Analysis),
    "highSpendingCategories": [string],
    "unnecessaryOrDiscretionarySpending": string
  },
  "recommendedBudget": {
    "needs": { "amount": number, "percentage": number, "description": string },
    "wants": { "amount": number, "percentage": number, "description": string },
    "savingsAndDebt": { "amount": number, "percentage": number, "description": string },
    "potentialMonthlySavings": number,
    "notes": string
  },
  "savingsPlan": {
    "emergencyFundTarget": number,
    "emergencyFundMonths": number,
    "emergencyFundCurrent": number,
    "monthsToCompleteEmergencyFund": number,
    "stepByStepPlan": [
      { "step": number, "action": string, "target": string, "timeline": string }
    ]
  },
  "debtSuggestions": {
    "strategy": string,
    "monthlyAllocation": number,
    "estimatedPayoffMonths": number,
    "recommendations": [string]
  },
  "goalProgress": {
    "overallStatus": string,
    "insights": [string]
  },
  "actionSteps": [
    { "title": string, "description": string, "priority": "High" | "Medium" | "Low", "impact": string }
  ],
  "disclaimer": "Educational Disclaimer: This AI-generated financial advice is educational and not professional financial advice."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return parsed;
  } catch (error) {
    console.warn('[AI Advisor] Gemini API call encountered error:', error.message, 'Falling back to deterministic financial engine.');
    return generateDeterministicFinancialAdvice(userData);
  }
}
