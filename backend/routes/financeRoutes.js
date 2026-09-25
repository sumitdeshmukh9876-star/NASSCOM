import express from 'express';
import {
  getFinancialProfile,
  createFinancialProfile,
  updateFinancialProfile,
  seedDemoData,
} from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFinancialProfile)
  .post(protect, createFinancialProfile)
  .put(protect, updateFinancialProfile);

router.post('/seed-demo', protect, seedDemoData);

export default router;
