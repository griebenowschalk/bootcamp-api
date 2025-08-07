import type { CookieOptions, NextFunction, Request, Response } from 'express';
import asyncHandler from '@/middleware/async';
import User from '@/models/User';
import type { IUser } from '@/models/User';
import ErrorResponse from '@/utils/errorResponse';
import type { UserRequest } from '@/types/queryTypes';

/**
 * @description Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const user: IUser = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

/**
 * @description Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse('Please provide an email and password', 400)
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  const options: CookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE as string) * 24 * 60 * 60 * 1000 // Convert to milliseconds
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

/**
 * @description Get current user
 * @route GET /api/v1/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  res.status(200).json({ success: true, data: user });
});

export { register, login, getMe };
