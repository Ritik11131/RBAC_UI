import { PaginationParams, PaginatedResponse, PaginationMeta } from './module.interface';

/**
 * Entity attributes interface
 */
export interface EntityAttributes {
  type?: string;
  industry?: string;
  [key: string]: any; // Allow for other arbitrary attributes
}

/**
 * Entity interface matching API response
 */
export interface Entity {
  id: string;
  name: string;
  email_id?: string;
  mobile_no?: string;
  profile_id?: string;
  entity_id?: string; // Root entity ID
  attributes?: EntityAttributes;
  created_by?: string;
  creation_time?: string;
  last_update_on?: string;
}

/**
 * Entity payload for create/update operations
 */
export interface EntityPayload {
  name: string;
  email_id?: string;
  mobile_no?: string;
  profile_id?: string;
  entity_id?: string; // Root entity ID
  attributes?: EntityAttributes;
}

/**
 * Entity pagination parameters
 */
export interface EntityPaginationParams extends PaginationParams {
  entityId?: string; // Filter by entity ID (logged-in user's entityId)
}

/**
 * Paginated entities response
 */
export interface PaginatedEntitiesResponse extends PaginatedResponse<Entity> {}

