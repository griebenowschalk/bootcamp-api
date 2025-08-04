/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Query Parser Utility
 *
 * Converts Express query parameters to Mongoose-compatible query objects.
 * Handles MongoDB operators (gt, gte, lt, lte, in) and numeric type conversion.
 *
 * Example:
 * Input:  ?averageCost[lte]=10000&careers[in]=Web Development
 * Output: { averageCost: { $lte: 10000 }, careers: { $in: ['Web Development'] } }
 */

/**
 * Converts query parameters to Mongoose format
 * @param query - Express request query object
 * @returns Mongoose-compatible query object
 */
export const parseQuery = (query: any) => {
  // Convert query operators to MongoDB format (gt -> $gt, lte -> $lte, etc.)
  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  const parsedQuery = JSON.parse(queryStr);

  // Restructure query for Mongoose
  const mongooseQuery: any = {};

  Object.keys(parsedQuery).forEach(key => {
    if (key.includes('[') && key.includes(']')) {
      // Handle nested operators like "averageCost[$lte]"
      const match = key.match(/^(.+)\[(\$[^\]]+)\]$/);
      if (match) {
        const [, fieldName, operator] = match;
        if (fieldName && operator) {
          if (!mongooseQuery[fieldName]) {
            mongooseQuery[fieldName] = {};
          }
          let value = parsedQuery[key];

          // Convert numeric fields to numbers for proper comparison
          if (
            (fieldName === 'averageCost' || fieldName === 'averageRating') &&
            typeof value === 'string'
          ) {
            value = Number(value);
          }

          mongooseQuery[fieldName][operator] = value;
        }
      }
    } else {
      // Handle regular fields without operators
      mongooseQuery[key] = parsedQuery[key];
    }
  });

  return mongooseQuery;
};
