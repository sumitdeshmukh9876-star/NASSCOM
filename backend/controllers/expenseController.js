import Expense from '../models/Expense.js';

// @desc    Get all user expenses with optional category/date filtering
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, search, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Expense.countDocuments(query);
    const totalAmount = (await Expense.find(query)).reduce((sum, item) => sum + item.amount, 0);

    res.json({
      success: true,
      count: expenses.length,
      totalCount,
      totalAmount: Number(totalAmount.toFixed(2)),
      expenses,
    });
  } catch (error) {
    console.error('getExpenses error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching expenses' });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes, isRecurring } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide title and amount' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    const expense = await Expense.create({
      user: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      isRecurring: Boolean(isRecurring),
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense,
    });
  } catch (error) {
    console.error('createExpense error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found or unauthorized' });
    }

    const { title, amount, category, date, notes, isRecurring } = req.body;

    if (title) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes.trim();
    if (isRecurring !== undefined) expense.isRecurring = Boolean(isRecurring);

    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    console.error('updateExpense error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('deleteExpense error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting expense' });
  }
};
