import type { NextFunction, Request } from 'express';
import asyncHandler from '@/middleware/async';
import Review, { type IReview } from '@/models/Review';
import type { AdvanceResponse, UserRequest } from '@/types/queryTypes';
import ErrorResponse from '@/utils/errorResponse';
import Bootcamp from '@/models/Bootcamp';

/**
 * @description Get all reviews
 * @route GET /api/v1/reviews
 * @route GET /api/v1/bootcamps/:bootcampId/reviews
 * @access Public
 */
const getReviews = asyncHandler(async (req: Request, res: AdvanceResponse) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 * @description Get a single review
 * @route GET /api/v1/reviews/:id
 * @access Public
 */
const getReview = asyncHandler(
  async (req: Request, res: AdvanceResponse, next: NextFunction) => {
    const review = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description',
    });

    if (!review) {
      return next(
        new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ success: true, data: review });
  }
);

/**
 * @description Add a review
 * @route POST /api/v1/bootcamps/:bootcampId/reviews
 * @access Private
 */
const addReview = asyncHandler(
  async (req: UserRequest, res: AdvanceResponse, next: NextFunction) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user?.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.bootcampId}`,
          404
        )
      );
    }

    // Check if user has already reviewed the bootcamp
    const existingReview = await Review.findOne({
      bootcamp: req.params.bootcampId,
      user: req.user?.id,
    });

    if (existingReview) {
      return next(
        new ErrorResponse(`User has already reviewed this bootcamp`, 400)
      );
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);

/**
 * @description Update a review
 * @route PUT /api/v1/reviews/:id
 * @access Private
 */
const updateReview = asyncHandler(
  async (req: UserRequest, res: AdvanceResponse, next: NextFunction) => {
    let review = (await Review.findById(req.params.id)) as IReview | null;

    if (!review) {
      return next(
        new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
      );
    }

    if (review.user.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(
        new ErrorResponse('User is not authorized to update this review', 401)
      );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  }
);

/**
 * @description Delete a review
 * @route DELETE /api/v1/reviews/:id
 * @access Private
 */
const deleteReview = asyncHandler(
  async (req: UserRequest, res: AdvanceResponse, next: NextFunction) => {
    const review = (await Review.findById(req.params.id)) as IReview | null;

    if (!review) {
      return next(
        new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
      );
    }

    if (review.user.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(
        new ErrorResponse('User is not authorized to delete this review', 401)
      );
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: review,
    });
  }
);

export { getReviews, getReview, addReview, updateReview, deleteReview };
