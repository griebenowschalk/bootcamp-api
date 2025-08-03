import type { NextFunction, Request, Response } from 'express';
import ErrorResponse from '@/utils/errorResponse';
import asyncHandler from '@/middleware/async';
import Bootcamp from '@/models/Bootcamp';

/**
 * @description Get all bootcamps
 * @route GET /api/v1/bootcamps
 * @access Public
 */
const getBootcamps = asyncHandler(async (req: Request, res: Response) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

/**
 * @description Get a single bootcamp
 * @route GET /api/v1/bootcamps/:id
 * @access Private
 */
const getBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  }
);

/**
 * @description Create a new bootcamp
 * @route POST /api/v1/bootcamps
 * @access Private
 */
const createBootcamp = asyncHandler(async (req: Request, res: Response) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

/**
 * @description Update a bootcamp
 * @route PUT /api/v1/bootcamps/:id
 * @access Private
 */
const updateBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  }
);

/**
 * @description Delete a bootcamp
 * @route DELETE /api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  }
);

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
};
