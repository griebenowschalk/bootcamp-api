import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '@/middleware/async';
import User from '@/models/User';
import type { AdvanceResponse } from '@/types/queryTypes';
import ErrorResponse from '@/utils/errorResponse';

/**
 * @description Get all users
 * @route GET /api/v1/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req: Request, res: AdvanceResponse) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @description Get a single user
 * @route GET /api/v1/users/:id
 * @access Private/Admin
 */
const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: user });
  }
);

/**
 * @description Create user
 * @route POST /api/v1/users
 * @access Private/Admin
 */
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

/**
 * @description Update user
 * @route PUT /api/v1/users/:id
 * @access Private/Admin
 */
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

/**
 * @description Delete user
 * @route DELETE /api/v1/users/:id
 * @access Private/Admin
 */
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});

export { getUsers, getUser, createUser, updateUser, deleteUser };
