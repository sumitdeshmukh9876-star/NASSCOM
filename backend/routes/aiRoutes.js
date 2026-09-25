import express from 'express';
import { getAIAdvice } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/advice', protect, getAIAdvice);

export default router;
