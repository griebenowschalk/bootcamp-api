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

## Environment Variables

Create a `config/config.env` file with:

```
NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

## API Endpoints

- `GET /api/v1/bootcamps` - Get all bootcamps
- `POST /api/v1/bootcamps` - Create a new bootcamp
- `GET /api/v1/bootcamps/:id` - Get a single bootcamp
- `PUT /api/v1/bootcamps/:id` - Update a bootcamp
- `DELETE /api/v1/bootcamps/:id` - Delete a bootcamp
