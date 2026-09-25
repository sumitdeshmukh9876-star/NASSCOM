import FinancialProfile from '../models/FinancialProfile.js';
import Expense from '../models/Expense.js';
import FinancialGoal from '../models/FinancialGoal.js';
import { generateAIFinancialAdvice } from '../services/aiService.js';

// @desc    Generate personalized AI Financial Advice
// @route   POST /api/ai/advice
// @access  Private
export const getAIAdvice = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional override/updated values submitted directly from AI Advisor form
    const {
      monthlyIncome: inputIncome,
      currentSavings: inputSavings,
      totalDebt: inputDebt,
      monthlySavingsTarget: inputSavingsTarget,
      riskPreference: inputRisk,
      budgetLimit: inputBudgetLimit,
    } = req.body;

    // Retrieve or initialize profile
    let profile = await FinancialProfile.findOne({ user: userId });
    if (!profile) {
      profile = new FinancialProfile({ user: userId });
    }

    // If user provided updated figures in the AI form, persist them
    let hasUpdates = false;
    if (inputIncome !== undefined && inputIncome !== '') {
      profile.monthlyIncome = Number(inputIncome);
      hasUpdates = true;
    }
    if (inputSavings !== undefined && inputSavings !== '') {
      profile.currentSavings = Number(inputSavings);
      hasUpdates = true;
    }
    if (inputDebt !== undefined && inputDebt !== '') {
      profile.totalDebt = Number(inputDebt);
      hasUpdates = true;
    }
    if (inputSavingsTarget !== undefined && inputSavingsTarget !== '') {
      profile.monthlySavingsTarget = Number(inputSavingsTarget);
      hasUpdates = true;
    }
    if (inputRisk) {
      profile.riskPreference = inputRisk;
      hasUpdates = true;
    }
    if (inputBudgetLimit !== undefined && inputBudgetLimit !== '') {
      profile.budgetLimit = Number(inputBudgetLimit);
      hasUpdates = true;
    }

    if (hasUpdates) {
      await profile.save();
    }

    // Fetch user's expenses and goals
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
    const goals = await FinancialGoal.find({ user: userId }).sort({ targetDate: 1 });

    // Calculate current month's expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const currentMonthExpenses = expenses.filter(
      (e) => new Date(e.date) >= startOfMonth && new Date(e.date) <= endOfMonth
    );

    const totalExpenses = currentMonthExpenses.length > 0
      ? currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
      : expenses.reduce((sum, e) => sum + e.amount, 0);

    // Compute category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const totalAllExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      amount: categoryTotals[cat],
      percentage: totalAllExpenses > 0 ? Number(((categoryTotals[cat] / totalAllExpenses) * 100).toFixed(1)) : 0,
    }));

    // Package payload for AI service
    const financialData = {
      monthlyIncome: profile.monthlyIncome,
      totalExpenses,
      currentSavings: profile.currentSavings,
      totalDebt: profile.totalDebt,
      monthlySavingsTarget: profile.monthlySavingsTarget,
      riskPreference: profile.riskPreference,
      budgetLimit: profile.budgetLimit,
      categoryBreakdown,
      goals: goals.map((g) => ({
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        category: g.category,
        targetDate: g.targetDate,
      })),
      expenses: expenses.slice(0, 15).map((e) => ({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
      })),
    };

    const advice = await generateAIFinancialAdvice(financialData);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      financialData: {
        monthlyIncome: profile.monthlyIncome,
        totalExpenses,
        currentSavings: profile.currentSavings,
        totalDebt: profile.totalDebt,
        riskPreference: profile.riskPreference,
        monthlySavingsTarget: profile.monthlySavingsTarget,
      },
      advice,
    });
  } catch (error) {
    console.error('getAIAdvice error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error generating AI advice' });
  }
};
