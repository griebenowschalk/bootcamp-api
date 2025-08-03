import type { Request, Response } from 'express';
import Bootcamp from '@/models/Bootcamp';

/**
 * @description Get all bootcamps
 * @route GET /api/v1/bootcamps
 * @access Public
 */
const getBootcamps = async (req: Request, res: Response) => {
  try {
    const bootcamps = await Bootcamp.find();
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(400).json({ success: false, message: 'Unknown error' });
    }
  }
};

/**
 * @description Get a single bootcamp
 * @route GET /api/v1/bootcamps/:id
 * @access Private
 */
const getBootcamp = async (req: Request, res: Response) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res
        .status(404)
        .json({ success: false, message: 'Bootcamp not found' });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(400).json({ success: false, message: 'Unknown error' });
    }
  }
};

/**
 * @description Create a new bootcamp
 * @route POST /api/v1/bootcamps
 * @access Private
 */
const createBootcamp = async (req: Request, res: Response) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(400).json({ success: false, message: 'Unknown error' });
    }
  }
};

/**
 * @description Update a bootcamp
 * @route PUT /api/v1/bootcamps/:id
 * @access Private
 */
const updateBootcamp = async (req: Request, res: Response) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bootcamp) {
      return res
        .status(404)
        .json({ success: false, message: 'Bootcamp not found' });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(400).json({ success: false, message: 'Unknown error' });
    }
  }
};

/**
 * @description Delete a bootcamp
 * @route DELETE /api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = async (req: Request, res: Response) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      return res
        .status(404)
        .json({ success: false, message: 'Bootcamp not found' });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(400).json({ success: false, message: 'Unknown error' });
    }
  }
};

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
};
