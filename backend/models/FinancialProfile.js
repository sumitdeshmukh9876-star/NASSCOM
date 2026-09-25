import mongoose from 'mongoose';

const financialProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Monthly income cannot be negative'],
    },
    currentSavings: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Current savings cannot be negative'],
    },
    totalDebt: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total debt cannot be negative'],
    },
    riskPreference: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate',
    },
    monthlySavingsTarget: {
      type: Number,
      default: 0,
      min: [0, 'Monthly savings target cannot be negative'],
    },
    budgetLimit: {
      type: Number,
      default: 0,
      min: [0, 'Budget limit cannot be negative'],
    },
    emergencyFundMonthsTarget: {
      type: Number,
      default: 6,
      min: 1,
      max: 24,
    },
  },
  {
    timestamps: true,
  }
);

export const FinancialProfile = mongoose.model('FinancialProfile', financialProfileSchema);
export default FinancialProfile;
