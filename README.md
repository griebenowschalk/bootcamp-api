# Bootcamp API

A RESTful API for managing bootcamps built with Node.js, TypeScript, and Express.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Development**: tsx for hot reloading
- **Code Quality**: ESLint, Prettier, Husky

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run seeder:import` - Import sample data from `_data/bootcamps.json`
- `npm run seeder:delete` - Delete all bootcamp data from database

## Environment Variables

Create a `config/config.env` file with:

```
NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEOCODER_PROVIDER=provider
GEOCODER_API_KEY=provider_consumer_key
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=max_file_upload_size
```

## Data Seeding

The project includes sample data for testing:

- `_data/bootcamps.json` - Sample bootcamp data for seeding
- `_data/courses.json` - Sample course data for seeding
- Use `npm run seeder:import` to populate the database with sample data
- Use `npm run seeder:delete` to clear all bootcamp data

## API Endpoints

### Bootcamps

- `GET /api/v1/bootcamps` - Get all bootcamps
- `POST /api/v1/bootcamps` - Create a new bootcamp
- `GET /api/v1/bootcamps/:id` - Get a single bootcamp
- `PUT /api/v1/bootcamps/:id` - Update a bootcamp
- `DELETE /api/v1/bootcamps/:id` - Delete a bootcamp
- `GET /api/v1/bootcamps/radius/:zipcode/:distance` - Get bootcamps within a radius
- `PUT /api/v1/bootcamps/:id/photo` - Upload a photo for a bootcamp

### Courses

- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get a single course
- `POST /api/v1/bootcamps/:bootcampId/courses` - Add a course to a bootcamp
- `PUT /api/v1/courses/:id` - Update a course
- `DELETE /api/v1/courses/:id` - Delete a course
