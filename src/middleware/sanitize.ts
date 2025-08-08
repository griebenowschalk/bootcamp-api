/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';
import sanitize from 'mongo-sanitize';

function sanitizeClone<T>(value: T): T {
  // mongo-sanitize returns a sanitized clone; type it back to T
  return sanitize(value) as unknown as T;
}

/**
 * @description Arrays: zero the array and push sanitized items so the same array reference is preserved.
 *              Objects: delete all existing keys, then Object.assign from the sanitized clone.
 *              This ensures keys removed by sanitization (like $ne) don't linger on the original object.
 * @param target - The target object or array
 * @param source - The source object or array
 * @example
 * Before:
 * req.query = { price: { $gte: '1000' }, page: '2' }
 *
 * After sanitize clone:
 * { price: {}, page: '2' } (the $gte key is removed)
 *
 * replaceInPlace:
 * Deletes old keys from req.query, then assigns sanitized
 * keys → req.query (same reference) now equals { price: {}, page: '2' }.
 */
function replaceInPlace<T>(target: T, source: T): void {
  // If both are arrays, mutate target array to match source
  if (Array.isArray(target) && Array.isArray(source)) {
    target.length = 0; // clear target in-place
    target.push(...(source as unknown as unknown[])); // copy items
    return;
  }

  // If both are objects, mutate target object to match source
  if (
    target &&
    typeof target === 'object' &&
    source &&
    typeof source === 'object'
  ) {
    // 1) Remove all existing keys so stripped keys actually disappear
    Object.keys(target as object).forEach(k => {
      delete (target as any)[k];
    });
    // 2) Copy sanitized keys/values onto the same object reference
    Object.assign(target as object, source as object);
  }
}

export function sanitizeRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // body
  if (req.body && typeof req.body === 'object') {
    const sanitized = sanitizeClone(req.body);
    replaceInPlace(req.body as any, sanitized as any);
  }
  // params
  if (req.params && typeof req.params === 'object') {
    const sanitized = sanitizeClone(req.params);
    replaceInPlace(req.params as any, sanitized as any);
  }
  // query (read-only reference, mutate contents only)
  if (req.query && typeof req.query === 'object') {
    const sanitized = sanitizeClone(req.query);
    replaceInPlace(req.query as any, sanitized as any);
  }

  next();
}
