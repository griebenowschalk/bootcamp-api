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

import { advancedResults } from '@/middleware/query';
import Bootcamp from '@/models/Bootcamp';

// Include other resource routers
import courseRouter from '@/routes/courses';
import type { Document, Model, PopulateOptions } from 'mongoose';

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.put('/:id/photo', uploadBootcampPhoto);

router
  .route('/')
  .get(
    advancedResults(Bootcamp as unknown as Model<Document<typeof Bootcamp>>, [
      {
        path: 'courses',
      } as PopulateOptions,
    ]),
    getBootcamps
  )
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

export default router;
