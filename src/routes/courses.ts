import express from 'express';
import {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} from '@/controllers/courses';

const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

export default router;
