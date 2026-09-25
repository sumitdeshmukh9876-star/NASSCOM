import FinancialGoal from '../models/FinancialGoal.js';

// @desc    Get all financial goals for logged in user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await FinancialGoal.find({ user: req.user.id }).sort({ targetDate: 1 });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedCount = goals.filter((g) => g.isCompleted).length;

    res.json({
      success: true,
      count: goals.length,
      completedCount,
      totalTarget,
      totalSaved,
      goals,
    });
  } catch (error) {
    console.error('getGoals error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching goals' });
  }
};

// @desc    Create a new financial goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, category, targetDate, monthlyContribution, priority } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, target amount, and target date' });
    }

    const target = Number(targetAmount);
    const current = Number(currentAmount) || 0;

    const goal = await FinancialGoal.create({
      user: req.user.id,
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      category: category || 'Emergency Fund',
      targetDate: new Date(targetDate),
      monthlyContribution: Number(monthlyContribution) || 0,
      priority: priority || 'Medium',
      isCompleted: current >= target,
    });

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      goal,
    });
  } catch (error) {
    console.error('createGoal error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating goal' });
  }
};

// @desc    Update a financial goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const goal = await FinancialGoal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
    }

    const {
      title,
      targetAmount,
      currentAmount,
      category,
      targetDate,
      monthlyContribution,
      priority,
      isCompleted,
      addFunds, // optional convenience field to deposit money towards goal
    } = req.body;

    if (title) goal.title = title.trim();
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (addFunds !== undefined && Number(addFunds) > 0) {
      goal.currentAmount = (goal.currentAmount || 0) + Number(addFunds);
    }
    if (category) goal.category = category;
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (monthlyContribution !== undefined) goal.monthlyContribution = Number(monthlyContribution);
    if (priority) goal.priority = priority;

    if (isCompleted !== undefined) {
      goal.isCompleted = Boolean(isCompleted);
    } else {
      goal.isCompleted = goal.currentAmount >= goal.targetAmount;
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Financial goal updated successfully',
      goal,
    });
  } catch (error) {
    console.error('updateGoal error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating goal' });
  }
};

// @desc    Delete a financial goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await FinancialGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Financial goal deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('deleteGoal error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting goal' });
  }
};
