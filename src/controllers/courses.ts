import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '@/middleware/async';
import Course from '@/models/Course';
import ErrorResponse from '@/utils/errorResponse';
import Bootcamp from '@/models/Bootcamp';
import type { AdvanceResponse } from '@/types/queryTypes';

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
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with this ID ${req.params.id}`, 404)
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
 * @description Add a course
 * @route POST /api/v1/bootcamps/:bootcampId/courses
 * @access Private
 */
const addCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.bootcampId}`,
          404
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
  async (req: Request, res: Response, next: NextFunction) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
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
 * @description Delete a course
 * @route DELETE /api/v1/courses/:id
 * @access Private
 */
const deleteCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with this ID ${req.params.id}`, 404)
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
