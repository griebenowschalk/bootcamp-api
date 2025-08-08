import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '@/controllers/users';
import { protect, authorize } from '@/middleware/auth';
import User, { type IUser } from '@/models/User';
import { advancedResults } from '@/middleware/query';
import type { Model } from 'mongoose';

const router = express.Router();

router.use(protect, authorize('admin'));

router
  .route('/')
  .get(advancedResults(User as unknown as Model<IUser>), getUsers)
  .post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
