import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FinancialProfile from '../models/FinancialProfile.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_personal_finance_advisor_2025_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, occupation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      occupation: occupation || '',
    });

    // Create default financial profile for the new user
    await FinancialProfile.create({
      user: user._id,
      monthlyIncome: 0,
      currentSavings: 0,
      totalDebt: 0,
      riskPreference: 'Moderate',
      monthlySavingsTarget: 0,
      budgetLimit: 0,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        occupation: user.occupation,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        occupation: user.occupation,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = await FinancialProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await FinancialProfile.create({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        occupation: user.occupation,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error retrieving profile' });
  }
};

// @desc    Update user account info
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, occupation, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (occupation !== undefined) user.occupation = occupation;
    if (currency) user.currency = currency;

    await user.save();

    res.json({
      success: true,
      message: 'User profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        occupation: user.occupation,
        currency: user.currency,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
};
