import type {
  AllowedOperators,
  ParsedQuery,
  QueryInput,
  MongooseOperator,
  FieldQueryValueMap,
} from '@/types/queryTypes';

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
  // Define allowed MongoDB comparison operators
  const allowedOperators = ['gt', 'gte', 'lt', 'lte', 'in'] as const;
  const mongooseQuery: ParsedQuery = {};

  // Process each query parameter
  Object.entries(query).forEach(([key, value]) => {
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
