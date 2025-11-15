import { PaginationParams, PaginatedResponse } from './module.interface';

/**
 * User interface matching API response
 */
export interface User {
  id: string;
  email: string;
  name: string;
  mobile_no?: string;
  entity_id: string;
  role_id: string;
  is_active?: boolean;
  is_deleted?: boolean;
  attributes?: {
    bio?: string;
    address?: {
      country?: string;
      cityState?: string;
      postalCode?: string;
      taxId?: string;
    };
    social?: {
      facebook?: string;
      x?: string;
      linkedin?: string;
      instagram?: string;
    };
    [key: string]: any;
  };
  created_by?: string;
  creation_time?: string;
  last_update_on?: string;
}

/**
 * User payload for create operations
 */
export interface UserCreatePayload {
  email: string;
  password: string;
  name: string;
  mobile_no?: string;
  entity_id: string;
  role_id: string;
}

/**
 * User payload for update operations
 */
export interface UserUpdatePayload {
  name?: string;
  mobile_no?: string;
  entity_id?: string;
  role_id?: string;
  is_active?: boolean;
  attributes?: {
    bio?: string;
    address?: {
      country?: string;
      cityState?: string;
      postalCode?: string;
      taxId?: string;
    };
    social?: {
      facebook?: string;
      x?: string;
      linkedin?: string;
      instagram?: string;
    };
    [key: string]: any;
  };
}

/**
 * User pagination parameters
 */
export interface UserPaginationParams extends PaginationParams {
  entityId?: string; // Filter by entity ID (logged-in user's entityId)
}

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse extends PaginatedResponse<User> {}

