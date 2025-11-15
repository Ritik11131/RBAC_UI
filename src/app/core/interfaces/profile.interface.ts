/**
 * Profile interface matching the API response structure
 */
export interface Profile {
  id: string;
  name: string;
  entity_id: string;
  attributes?: {
    description?: string;
    [key: string]: any;
  };
  created_by?: string;
  creation_time?: string;
  last_update_on?: string;
}

/**
 * Profile creation/update payload
 */
export interface ProfilePayload {
  name: string;
  entity_id: string;
  attributes?: {
    description?: string;
    [key: string]: any;
  };
}

/**
 * Query parameters for paginated profile requests
 */
export interface ProfilePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  entityId?: string; // Filter by entity ID
}

