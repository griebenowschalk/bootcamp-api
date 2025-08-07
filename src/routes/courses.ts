import express from 'express';
import {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} from '@/controllers/courses';
import { protect, authorize } from '@/middleware/auth';

import { advancedResults } from '@/middleware/query';
import Course, { type ICourse } from '@/models/Course';
import type { Model, PopulateOptions } from 'mongoose';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Course as unknown as Model<ICourse>, [
      {
        path: 'bootcamp',
        select: 'name description',
      } as PopulateOptions,
    ]),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

export default router;
