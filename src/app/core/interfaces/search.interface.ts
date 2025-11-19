import { Entity } from './entity.interface';
import { User } from './user.interface';
import { Profile } from './profile.interface';
import { Role } from './role.interface';
import { PaginationMeta } from './module.interface';

/**
 * Paginated result for search
 */
export interface PaginatedSearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Global search response structure
 */
export interface GlobalSearchResponse {
  entities: PaginatedSearchResult<Entity>;
  users: PaginatedSearchResult<User>;
  profiles: PaginatedSearchResult<Profile>;
  roles: PaginatedSearchResult<Role>;
  pagination: {
    totalResults: number;
    hasMore: boolean;
  };
}

/**
 * API response wrapper for global search
 */
export interface GlobalSearchApiResponse {
  success: boolean;
  message: string;
  data: GlobalSearchResponse;
  timestamp: number;
  path: string;
}

/**
 * Hierarchy node for entities (with isSelected flag)
 */
export interface EntityHierarchyNode extends Entity {
  isSelected?: boolean;
  children?: EntityHierarchyNode[];
}

/**
 * Hierarchy node for users (with isSelected flag)
 */
export interface UserHierarchyNode extends User {
  isSelected?: boolean;
  children?: UserHierarchyNode[];
  entity?: {
    id: string;
    name: string;
  };
}

/**
 * User entity info
 */
export interface UserEntityInfo {
  id: string;
  name: string;
  email_id?: string;
}

/**
 * Selected resource info
 */
export interface SelectedResource {
  type: SearchType;
  id: string;
  name: string;
  entityId?: string;
}

/**
 * Entity hierarchy response structure
 */
export interface EntityHierarchyResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  hierarchy: EntityHierarchyNode;
}

/**
 * User hierarchy response structure
 */
export interface UserHierarchyResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  entityHierarchy: EntityHierarchyNode;
  userHierarchy: UserHierarchyNode;
}

/**
 * Profile hierarchy response structure
 */
export interface ProfileHierarchyResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  profile: Profile;
  entityHierarchy: EntityHierarchyNode;
}

/**
 * Role hierarchy response structure
 */
export interface RoleHierarchyResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  role: Role;
  entityHierarchy: EntityHierarchyNode;
}

/**
 * Union type for all hierarchy responses
 */
export type HierarchyResponse = 
  | EntityHierarchyResponse 
  | UserHierarchyResponse 
  | ProfileHierarchyResponse 
  | RoleHierarchyResponse;

/**
 * Hierarchy API response
 */
export interface HierarchyApiResponse {
  success: boolean;
  message: string;
  data: HierarchyResponse;
  timestamp: number;
  path: string;
}

/**
 * Search type filter
 */
export type SearchType = 'entity' | 'user' | 'profile' | 'role';

/**
 * Search parameters
 */
export interface SearchParams {
  q: string;
  type?: SearchType | SearchType[];
  page?: number;
  limit?: number;
}

