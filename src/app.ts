import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ path: './config/config.env' });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'colors';
import connectDB from '@/config/db';
import errorHandler from '@/middleware/error';
import asyncHandler from '@/middleware/async';

// Connect to database
connectDB();

// Routes
import bootcamps from '@/routes/bootcamps';
import courses from '@/routes/courses';
import auth from '@/routes/auth';
import users from '@/routes/users';

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File uploading
app.use(fileUpload());

// Cookie parser
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Mounting routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

// Error handler
app.use(errorHandler);

// Async handler
app.use(asyncHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close server & exit process
  server.close(() => process.exit(1));
});
