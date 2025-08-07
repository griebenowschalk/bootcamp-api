import express from 'express';
import {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} from '@/controllers/courses';

import { advancedResults } from '@/middleware/query';
import Course from '@/models/Course';
import type { Document, Model, PopulateOptions } from 'mongoose';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Course as unknown as Model<Document>, [
      {
        path: 'bootcamp',
        select: 'name description',
      } as PopulateOptions,
    ]),
    getCourses
  )
  .post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

export default router;
