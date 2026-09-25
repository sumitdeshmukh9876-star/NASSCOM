import mongoose from 'mongoose';

const financialGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please specify the target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    category: {
      type: String,
      enum: [
        'Emergency Fund',
        'Retirement',
        'Home Purchase',
        'Debt Freedom',
        'Vacation & Travel',
        'Vehicle',
        'Education',
        'Investment',
        'Other',
      ],
      default: 'Emergency Fund',
    },
    targetDate: {
      type: Date,
      required: [true, 'Please specify a target date'],
    },
    monthlyContribution: {
      type: Number,
      default: 0,
      min: [0, 'Monthly contribution cannot be negative'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

financialGoalSchema.index({ user: 1, targetDate: 1 });

export const FinancialGoal = mongoose.model('FinancialGoal', financialGoalSchema);
export default FinancialGoal;
