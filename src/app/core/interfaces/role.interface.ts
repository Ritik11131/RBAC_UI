import { PaginationParams, PaginatedResponse, PaginationMeta } from './module.interface';

/**
 * Permission interface for roles
 */
export interface Permission {
  moduleId: string;
  name: string;
  read: boolean;
  write: boolean;
}

/**
 * Role interface matching API response
 */
export interface Role {
  id: string;
  name: string;
  entityId: string;
  permissions?: Permission[];
  created_by?: string;
  creation_time?: string;
  last_update_on?: string;
}

/**
 * Role payload for create/update operations
 */
export interface RolePayload {
  name: string;
  entityId: string;
  permissions: Permission[];
}

/**
 * Role pagination parameters
 */
export interface RolePaginationParams extends PaginationParams {
  entityId?: string; // Filter by entity ID (logged-in user's entityId)
}

/**
 * Paginated roles response
 */
export interface PaginatedRolesResponse extends PaginatedResponse<Role> {}

