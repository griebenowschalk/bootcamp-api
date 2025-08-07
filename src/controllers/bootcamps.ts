import type { NextFunction, Request, Response } from 'express';
import ErrorResponse from '@/utils/errorResponse';
import asyncHandler from '@/middleware/async';
import Bootcamp, { type IBootcamp } from '@/models/Bootcamp';
import type { AdvanceResponse, UserRequest } from '@/types/queryTypes';
import geocoder from '@/utils/geocoder';
import type { UploadedFile } from 'express-fileupload';
import path from 'path';

/**
 * @description Get all bootcamps
 * @route GET /api/v1/bootcamps
 * @access Public
 */
const getBootcamps = asyncHandler(
  async (req: Request, res: AdvanceResponse) => {
    res.status(200).json(res.advancedResults);
  }
);

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
const createBootcamp = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Add user to req.body
    req.body.user = req.user?.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user?.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user?.role !== 'admin') {
      return next(
        new ErrorResponse('User has already published a bootcamp', 400)
      );
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
  }
);

/**
 * @description Update a bootcamp
 * @route PUT /api/v1/bootcamps/:id
 * @access Private
 */
const updateBootcamp = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let bootcamp = (await Bootcamp.findById(req.params.id)) as IBootcamp | null;

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
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
        new ErrorResponse('User is not authorized to update this bootcamp', 401)
      );
    }

    bootcamp = (await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })) as IBootcamp;

    res.status(200).json({ success: true, data: bootcamp });
  }
);

/**
 * @description Delete a bootcamp
 * @route DELETE /api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const bootcamp = (await Bootcamp.findById(
      req.params.id
    )) as IBootcamp | null;

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
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
        new ErrorResponse('User is not authorized to delete this bootcamp', 401)
      );
    }

    await bootcamp.deleteOne();

    res.status(200).json({ success: true, data: bootcamp });
  }
);

/**
 * @description Get bootcamps within a radius
 * @route GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access Private
 */
const getBootcampsInRadius = asyncHandler(
  async (req: Request, res: Response) => {
    const { zipcode, distance } = req.params;
    // Get lat/lng from geocoder
    const loc = await geocoder().geocode(zipcode || '');
    const lat = loc[0]?.latitude;
    const lng = loc[0]?.longitude;

    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = parseInt(distance || '0') / 3963;

    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  }
);

/**
 * @description Upload photo for bootcamp
 * @route PUT /api/v1/bootcamps/:id/photo
 * @access Private
 */
const uploadBootcampPhoto = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const bootcamp = (await Bootcamp.findById(
      req.params.id
    )) as IBootcamp | null;

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with this ID ${req.params.id}`,
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
        new ErrorResponse('User is not authorized to update this bootcamp', 401)
      );
    }

    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file as UploadedFile;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check file size
    if (file.size > parseInt(process.env.MAX_FILE_UPLOAD as string)) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${parseInt(process.env.MAX_FILE_UPLOAD as string)}`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // Make sure the directory exists
    await file.mv(
      path.join(process.env.FILE_UPLOAD_PATH as string, file.name),
      async err => {
        if (err) {
          console.log(err);
          return next(new ErrorResponse(`Problem with file upload`, 500));
        }
      }
    );

    await bootcamp.updateOne({ photo: file.name });

    res.status(200).json({ success: true, data: bootcamp });
  }
);

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
};
