import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the expense amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Housing',
        'Food & Dining',
        'Transportation',
        'Utilities',
        'Healthcare',
        'Entertainment',
        'Shopping',
        'Debt Payment',
        'Education',
        'Personal Care',
        'Other',
      ],
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user expenses by date
expenseSchema.index({ user: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
