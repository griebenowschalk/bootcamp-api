import type { CookieOptions, NextFunction, Request, Response } from 'express';
import asyncHandler from '@/middleware/async';
import User from '@/models/User';
import type { IUser } from '@/models/User';
import ErrorResponse from '@/utils/errorResponse';
import { sendPasswordResetEmail } from '@/utils/sendEmail';
import type { UserRequest } from '@/types/queryTypes';
import { hashToken } from '@/utils/security';

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

/**
 * @description Logout user
 * @route GET /api/v1/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req: UserRequest, res: Response) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000) });

  res.status(200).json({ success: true, data: {} });
});

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

/**
 * @description Update password
 * @route PUT /api/v1/auth/updatepassword
 * @access Private
 */
const updatePassword = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

/**
 * @description Update user details
 * @route PUT /api/v1/auth/updatedetails
 * @access Private
 */
const updateDetails = asyncHandler(async (req: UserRequest, res: Response) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user?.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

/**
 * @description Forgot password
 * @route POST /api/v1/auth/forgotpassword
 * @access Public
 */
const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (await User.findOne({
      email: req.body.email,
    })) as IUser;

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  }
);

/**
 * @description Reset password
 * @route PUT /api/v1/auth/resetpassword/:resettoken
 * @access Public
 */
const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get hashed token
    const resetPasswordToken = hashToken(req.params.resettoken || '');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

export {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
};
