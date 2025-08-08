import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '@/middleware/async';
import Course, { type ICourse } from '@/models/Course';
import ErrorResponse from '@/utils/errorResponse';
import Bootcamp from '@/models/Bootcamp';
import type { AdvanceResponse, UserRequest } from '@/types/queryTypes';

/**
 * @description Get all courses or courses for a specific bootcamp
 * @route GET /api/v1/courses
 * @route GET /api/v1/bootcamps/:bootcampId/courses
 * @access Public
 */
const getCourses = asyncHandler(async (req: Request, res: AdvanceResponse) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 * @description Get a single course
 * @route GET /api/v1/courses/:id
 * @access Public
 */
const getCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let course = await Course.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description',
    });

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with this ID ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

/**
 * @description Add a course
 * @route POST /api/v1/bootcamps/:bootcampId/courses
 * @access Private
 */
const addCourse = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user?.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.bootcampId}`,
          404
        )
      );
    }

    // Check if user is owner of bootcamp
    if (
      bootcamp?.user.toString() !== req.user?.id &&
      req.user?.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'User is not authorized to add a course to this bootcamp',
          401
        )
      );
    }

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  }
);

/**
 * @description Update a course
 * @route PUT /api/v1/courses/:id
 * @access Private
 */
const updateCourse = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let course = (await Course.findById(req.params.id)) as ICourse | null;

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with this ID ${req.params.id}`, 404)
      );
    }

    if (
      course?.user.toString() !== req.user?.id &&
      req.user?.role !== 'admin'
    ) {
      return next(
        new ErrorResponse('User is not authorized to update this course', 401)
      );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

/**
 * @description Delete a course
 * @route DELETE /api/v1/courses/:id
 * @access Private
 */
const deleteCourse = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const course = (await Course.findById(req.params.id)) as ICourse | null;

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with this ID ${req.params.id}`, 404)
      );
    }

    if (
      course?.user.toString() !== req.user?.id &&
      req.user?.role !== 'admin'
    ) {
      return next(
        new ErrorResponse('User is not authorized to delete this course', 401)
      );
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

export { getCourses, getCourse, addCourse, updateCourse, deleteCourse };
