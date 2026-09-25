import FinancialProfile from '../models/FinancialProfile.js';
import Expense from '../models/Expense.js';
import FinancialGoal from '../models/FinancialGoal.js';

// @desc    Get financial profile & dashboard aggregated metrics for logged in user
// @route   GET /api/finance
// @access  Private
export const getFinancialProfile = async (req, res) => {
  try {
    let profile = await FinancialProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await FinancialProfile.create({
        user: req.user.id,
        monthlyIncome: 0,
        currentSavings: 0,
        totalDebt: 0,
        riskPreference: 'Moderate',
        monthlySavingsTarget: 0,
        budgetLimit: 0,
      });
    }

    // Calculate aggregated metrics
    // Total monthly expenses for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalMonthExpenses = monthExpenses.reduce((sum, item) => sum + item.amount, 0);

    // All expenses for overall category breakdown
    const allExpenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    const allExpensesTotal = allExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Category breakdown
    const categoryTotals = {};
    allExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      amount: categoryTotals[cat],
      percentage: allExpensesTotal > 0 ? Number(((categoryTotals[cat] / allExpensesTotal) * 100).toFixed(1)) : 0,
    }));

    // Financial Goals
    const goals = await FinancialGoal.find({ user: req.user.id });
    const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallGoalProgress = totalGoalTarget > 0 ? Math.min(100, Number(((totalGoalSaved / totalGoalTarget) * 100).toFixed(1))) : 0;

    // Savings percentage calculation
    const monthlyIncome = profile.monthlyIncome || 0;
    const currentSavings = profile.currentSavings || 0;
    const totalDebt = profile.totalDebt || 0;
    const netCashFlow = monthlyIncome - totalMonthExpenses;
    const savingsRate = monthlyIncome > 0 ? Number(((Math.max(0, netCashFlow) / monthlyIncome) * 100).toFixed(1)) : 0;

    // Budget status
    const budgetLimit = profile.budgetLimit || monthlyIncome * 0.8;
    const budgetRemaining = budgetLimit - totalMonthExpenses;
    const isOverBudget = totalMonthExpenses > budgetLimit;
    const budgetUsedPercentage = budgetLimit > 0 ? Number(((totalMonthExpenses / budgetLimit) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      profile,
      summary: {
        monthlyIncome,
        totalExpenses: totalMonthExpenses,
        currentSavings,
        totalDebt,
        netCashFlow,
        savingsRate,
        budgetLimit,
        budgetRemaining,
        isOverBudget,
        budgetUsedPercentage,
        overallGoalProgress,
        goalsCount: goals.length,
        completedGoalsCount: goals.filter((g) => g.isCompleted).length,
      },
      categoryBreakdown,
      recentExpenses: allExpenses.slice(0, 5),
    });
  } catch (error) {
    console.error('getFinancialProfile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching financial data' });
  }
};

// @desc    Create or initialize financial profile
// @route   POST /api/finance
// @access  Private
export const createFinancialProfile = async (req, res) => {
  try {
    let profile = await FinancialProfile.findOne({ user: req.user.id });

    if (profile) {
      return res.status(400).json({ success: false, message: 'Profile already exists, use PUT to update' });
    }

    const {
      monthlyIncome,
      currentSavings,
      totalDebt,
      riskPreference,
      monthlySavingsTarget,
      budgetLimit,
      emergencyFundMonthsTarget,
    } = req.body;

    profile = await FinancialProfile.create({
      user: req.user.id,
      monthlyIncome: Number(monthlyIncome) || 0,
      currentSavings: Number(currentSavings) || 0,
      totalDebt: Number(totalDebt) || 0,
      riskPreference: riskPreference || 'Moderate',
      monthlySavingsTarget: Number(monthlySavingsTarget) || 0,
      budgetLimit: Number(budgetLimit) || 0,
      emergencyFundMonthsTarget: Number(emergencyFundMonthsTarget) || 6,
    });

    res.status(201).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating financial profile' });
  }
};

// @desc    Update financial profile
// @route   PUT /api/finance
// @access  Private
export const updateFinancialProfile = async (req, res) => {
  try {
    let profile = await FinancialProfile.findOne({ user: req.user.id });

    const {
      monthlyIncome,
      currentSavings,
      totalDebt,
      riskPreference,
      monthlySavingsTarget,
      budgetLimit,
      emergencyFundMonthsTarget,
    } = req.body;

    if (!profile) {
      profile = new FinancialProfile({ user: req.user.id });
    }

    if (monthlyIncome !== undefined) profile.monthlyIncome = Number(monthlyIncome);
    if (currentSavings !== undefined) profile.currentSavings = Number(currentSavings);
    if (totalDebt !== undefined) profile.totalDebt = Number(totalDebt);
    if (riskPreference !== undefined) profile.riskPreference = riskPreference;
    if (monthlySavingsTarget !== undefined) profile.monthlySavingsTarget = Number(monthlySavingsTarget);
    if (budgetLimit !== undefined) profile.budgetLimit = Number(budgetLimit);
    if (emergencyFundMonthsTarget !== undefined) profile.emergencyFundMonthsTarget = Number(emergencyFundMonthsTarget);

    await profile.save();

    res.json({
      success: true,
      message: 'Financial profile updated successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating financial profile' });
  }
};

// @desc    Seed realistic demo financial data for the current user
// @route   POST /api/finance/seed-demo
// @access  Private
export const seedDemoData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Update or create financial profile with realistic data
    let profile = await FinancialProfile.findOne({ user: userId });
    if (!profile) {
      profile = new FinancialProfile({ user: userId });
    }

    profile.monthlyIncome = 6500;
    profile.currentSavings = 14200;
    profile.totalDebt = 8500;
    profile.riskPreference = 'Moderate';
    profile.monthlySavingsTarget = 1500;
    profile.budgetLimit = 4200;
    profile.emergencyFundMonthsTarget = 6;
    await profile.save();

    // 2. Clear existing sample expenses & goals if requested or replace
    await Expense.deleteMany({ user: userId });
    await FinancialGoal.deleteMany({ user: userId });

    // 3. Create realistic expenses for current and past weeks
    const today = new Date();
    const sampleExpenses = [
      { title: 'Apartment Rent', amount: 1850, category: 'Housing', daysAgo: 1, notes: 'Monthly studio rent' },
      { title: 'Trader Joe\'s Groceries', amount: 245.50, category: 'Food & Dining', daysAgo: 2, notes: 'Weekly organic groceries' },
      { title: 'Electric & Internet Utility', amount: 140.00, category: 'Utilities', daysAgo: 3, notes: 'ConEd + High speed fiber' },
      { title: 'Metro Transit Pass', amount: 128.00, category: 'Transportation', daysAgo: 5, notes: 'Monthly commuter card' },
      { title: 'Health Insurance Premium', amount: 280.00, category: 'Healthcare', daysAgo: 7, notes: 'Monthly employer co-pay' },
      { title: 'Dinner with Colleagues', amount: 95.00, category: 'Food & Dining', daysAgo: 8, notes: 'Italian bistro downtown' },
      { title: 'Student Loan Repayment', amount: 350.00, category: 'Debt Payment', daysAgo: 10, notes: 'Federal direct loan instalment' },
      { title: 'Spotify & Netflix Streaming', amount: 32.99, category: 'Entertainment', daysAgo: 12, notes: 'Digital subscription packages' },
      { title: 'Running Shoes & Gym Gear', amount: 135.00, category: 'Shopping', daysAgo: 14, notes: 'Nike running essentials' },
      { title: 'Weekend Movie & Snacks', amount: 48.00, category: 'Entertainment', daysAgo: 16, notes: 'IMAX movie night' },
      { title: 'Car Fuel & Maintenance', amount: 85.00, category: 'Transportation', daysAgo: 18, notes: 'Gas refill + tire rotation' },
      { title: 'Tech Gadget / Keyboard', amount: 110.00, category: 'Shopping', daysAgo: 20, notes: 'Ergonomic mechanical keyboard' },
      { title: 'Pharmacy & Vitamins', amount: 45.00, category: 'Healthcare', daysAgo: 22, notes: 'Multivitamins & supplies' },
    ];

    const expenseDocs = sampleExpenses.map((exp) => {
      const d = new Date(today);
      d.setDate(d.getDate() - exp.daysAgo);
      return {
        user: userId,
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        date: d,
        notes: exp.notes,
      };
    });

    await Expense.insertMany(expenseDocs);

    // 4. Create realistic goals
    const targetDate1 = new Date();
    targetDate1.setMonth(targetDate1.getMonth() + 5);

    const targetDate2 = new Date();
    targetDate2.setFullYear(targetDate2.getFullYear() + 2);

    const targetDate3 = new Date();
    targetDate3.setMonth(targetDate3.getMonth() + 8);

    const targetDate4 = new Date();
    targetDate4.setMonth(targetDate4.getMonth() + 14);

    const sampleGoals = [
      {
        user: userId,
        title: '6-Month Emergency Safety Fund',
        targetAmount: 20000,
        currentAmount: 14200,
        category: 'Emergency Fund',
        targetDate: targetDate1,
        monthlyContribution: 800,
        priority: 'High',
      },
      {
        user: userId,
        title: 'Credit Card & Student Debt Payoff',
        targetAmount: 8500,
        currentAmount: 3200,
        category: 'Debt Freedom',
        targetDate: targetDate3,
        monthlyContribution: 500,
        priority: 'High',
      },
      {
        user: userId,
        title: 'Tokyo & Kyoto Vacation Fund',
        targetAmount: 4500,
        currentAmount: 2400,
        category: 'Vacation & Travel',
        targetDate: targetDate4,
        monthlyContribution: 300,
        priority: 'Medium',
      },
      {
        user: userId,
        title: 'First Home Down Payment',
        targetAmount: 60000,
        currentAmount: 18500,
        category: 'Home Purchase',
        targetDate: targetDate2,
        monthlyContribution: 1000,
        priority: 'Medium',
      },
    ];

    await FinancialGoal.insertMany(sampleGoals);

    res.json({
      success: true,
      message: 'Realistic demo financial data generated successfully!',
    });
  } catch (error) {
    console.error('seedDemoData error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error seeding demo data' });
  }
};
