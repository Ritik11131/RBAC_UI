/**
 * Module interface matching the API response structure
 */
export interface Module {
  id: string;
  name: string;
  created_by: string;
  creation_time: string;
  last_update_on: string;
}

/**
 * Pagination metadata from API response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Standard API response structure with pagination
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: number;
  path: string;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

