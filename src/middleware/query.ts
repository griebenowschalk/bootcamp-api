// https://mongoosejs.com/docs/queries.html
import type {
  AllowedOperators,
  ParsedQuery,
  QueryInput,
  MongooseOperator,
  FieldQueryValueMap,
} from '@/types/queryTypes';
import type { Document, Query } from 'mongoose';
import type { Request } from 'express';
import Bootcamp from '@/models/Bootcamp';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

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
export const parseQuery = (query: QueryInput): ParsedQuery => {
  const queryRemoved = removeFields(query);
  // Define allowed MongoDB comparison operators
  const allowedOperators = ['gt', 'gte', 'lt', 'lte', 'in'] as const;
  const mongooseQuery: ParsedQuery = {};

  // Process each query parameter
  Object.entries(queryRemoved).forEach(([key, value]) => {
    // Check if the key contains an operator (e.g., "averageCost[lte]")
    const match = key.match(/^(\w+)\[(\w+)\]$/);

    if (match) {
      // Extract field name and operator from the key
      const [, field, op] = match;

      // Validate that both field and operator exist, and operator is allowed
      if (field && op && allowedOperators.includes(op as AllowedOperators)) {
        // Convert operator to MongoDB format (e.g., "lte" -> "$lte")
        const mongoOp = `$${op}` as MongooseOperator;

        // Initialize field object if it doesn't exist
        if (!mongooseQuery[field]) {
          mongooseQuery[field] = {} as FieldQueryValueMap;
        }

        // Convert string numbers to actual numbers for proper comparison
        // This handles cases like "10000" -> 10000 for numeric fields
        const parsedValue =
          typeof value === 'string' && !isNaN(Number(value))
            ? Number(value)
            : value;

        // Add the operator and value to the field object
        (mongooseQuery[field] as FieldQueryValueMap)[mongoOp] = parsedValue;
      }
    } else {
      // Handle regular fields without operators (e.g., "name", "careers")
      mongooseQuery[key] = value;
    }
  });

  return mongooseQuery;
};

export const queryPagination = async (
  req: Request,
  queryObject: Query<Document[], Document>
) => {
  const pageNumber = parseInt(req.query.page as string, 10) || DEFAULT_PAGE;
  const limitNumber = parseInt(req.query.limit as string, 10) || DEFAULT_LIMIT;
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = pageNumber * limitNumber;
  const total = await Bootcamp.countDocuments();
  const pagination: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  } = {};

  if (endIndex < total) {
    pagination.next = {
      page: pageNumber + 1,
      limit: limitNumber,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: pageNumber - 1,
      limit: limitNumber,
    };
  }

  queryObject = queryObject.skip(startIndex).limit(limitNumber);

  return {
    query: queryObject,
    pagination,
  };
};

export const handleQueryFields = (
  req: Request,
  queryObject: Query<Document[], Document>
) => {
  const { select, sort } = req.query;
  queryObject = selectFields(select as string, queryObject);
  queryObject = sortFields(sort as string, queryObject);

  return queryObject;
};

export const removeFields = (query: QueryInput) => {
  const removeFields = ['select', 'sort', 'limit', 'page'];
  const queryCopy = { ...query };

  removeFields.forEach(param => {
    delete queryCopy[param];
  });

  return queryCopy;
};

export const selectFields = (
  query: string | undefined,
  queryObject: Query<Document[], Document>
) => {
  if (query) {
    const selectFields = query.split(',').join(' ');
    return queryObject.select(selectFields);
  }

  return queryObject;
};

export const sortFields = (
  query: string | undefined,
  queryObject: Query<Document[], Document>
) => {
  if (query) {
    const sortFields = query.split(',').join(' ');
    return queryObject.sort(sortFields);
  } else {
    return queryObject.sort('-createdAt');
  }
};
