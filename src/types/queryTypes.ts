import type { Response } from 'express';
import type { Document } from 'mongoose';

export type FieldQueryValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

export type QueryInput = Record<string, FieldQueryValue>;

export type AllowedOperators = 'gt' | 'gte' | 'lt' | 'lte' | 'in';

export type MongooseOperator = `$${AllowedOperators}`;

export type FieldQueryValueMap = {
  [key in MongooseOperator]?: FieldQueryValue;
};

export type FieldQuery = FieldQueryValue | FieldQueryValueMap;

export type ParsedQuery = Record<string, FieldQuery>;

export type Pagination = {
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
};

export interface AdvanceResponse extends Response {
  advancedResults?: {
    data: Document[];
    success: boolean;
    count: number;
    pagination: Pagination;
  };
}
