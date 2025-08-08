import express from 'express';
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from '@/controllers/reviews';
import { advancedResults } from '@/middleware/query';
import Review, { type IReview } from '@/models/Review';
import type { Model, PopulateOptions } from 'mongoose';
import { protect, authorize } from '@/middleware/auth';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Review as unknown as Model<IReview>, [
      {
        path: 'bootcamp',
        select: 'name description',
      } as PopulateOptions,
    ]),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

export default router;
