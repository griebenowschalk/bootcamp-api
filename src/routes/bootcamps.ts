import express from 'express';
import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
} from '@/controllers/bootcamps';
import { protect, authorize } from '@/middleware/auth';
import { advancedResults } from '@/middleware/query';
import Bootcamp, { type IBootcamp } from '@/models/Bootcamp';

// Include other resource routers
import courseRouter from '@/routes/courses';
import type { Model, PopulateOptions } from 'mongoose';
import reviewRouter from '@/routes/reviews';

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.get('/radius/:zipcode/:distance', getBootcampsInRadius);

router.put(
  '/:id/photo',
  protect,
  authorize('publisher', 'admin'),
  uploadBootcampPhoto
);

router
  .route('/')
  .get(
    advancedResults(Bootcamp as unknown as Model<IBootcamp>, [
      {
        path: 'courses',
      } as PopulateOptions,
    ]),
    getBootcamps
  )
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

export default router;
