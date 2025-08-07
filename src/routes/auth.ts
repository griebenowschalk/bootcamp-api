import express from 'express';
import { register, login, getMe, forgotPassword } from '@/controllers/auth';
import { protect } from '@/middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

export default router;
