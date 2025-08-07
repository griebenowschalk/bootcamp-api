import type { NextFunction, Response } from 'express';
import ErrorResponse from '@/utils/errorResponse';
import asyncHandler from '@/middleware/async';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User, { type IUser } from '@/models/User';
import type { UserRequest } from '@/types/queryTypes';

export const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    //  else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    if (!token) {
      return next(new ErrorResponse('Unauthorized', 401));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      req.user = (await User.findById(decoded.id)) as IUser;

      next();
    } catch {
      return next(new ErrorResponse('Unauthorized', 401));
    }
  }
);

/**
 * @description Authorize user by role
 * @param roles - Array of roles
 * @returns Middleware function
 */
export const authorize = (...roles: string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as string)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
