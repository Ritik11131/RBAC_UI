import { Entity } from './entity.interface';
import { User } from './user.interface';
import { Profile } from './profile.interface';
import { Role } from './role.interface';
import { Meter } from './meter.interface';
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
  meters: PaginatedSearchResult<Meter>;
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
 * Path item in the linear path array
 */
export interface PathItem {
  id: string;
  name: string;
  type: SearchType;
  isSelected: boolean;
  email_id?: string;
  email?: string;
  entityId?: string;
  // Future-proof: Allow for expandable children if API adds pagination
  hasChildren?: boolean;
  childrenCount?: number;
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
  entityId?: string | null;
}

/**
 * Entity path response structure (path-only, linear array)
 */
export interface EntityPathResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  path: PathItem[];
}

/**
 * User path response structure (path-only, linear arrays)
 */
export interface UserPathResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  entityPath: PathItem[];
  userPath: PathItem[];
}

/**
 * Profile path response structure (path-only, linear arrays)
 */
export interface ProfilePathResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  profile: Profile;
  entityPath: PathItem[];
  userPath: PathItem[];
}

/**
 * Role path response structure (path-only, linear arrays)
 */
export interface RolePathResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  role: Role;
  entityPath: PathItem[];
  userPath: PathItem[];
}

/**
 * Meter path response structure (path-only, linear arrays)
 */
export interface MeterPathResponse {
  userEntity: UserEntityInfo;
  selectedResource: SelectedResource;
  meter: Meter;
  entityPath: PathItem[];
  userPath: PathItem[];
}

/**
 * Union type for all path responses
 */
export type PathResponse = 
  | EntityPathResponse 
  | UserPathResponse 
  | ProfilePathResponse 
  | RolePathResponse
  | MeterPathResponse;

/**
 * Path API response (hierarchy endpoint returns path)
 */
export interface PathApiResponse {
  success: boolean;
  message: string;
  data: PathResponse;
  timestamp: number;
  path: string;
}

/**
 * Search type filter
 */
export type SearchType = 'entity' | 'user' | 'profile' | 'role' | 'meter';

/**
 * Search parameters
 */
export interface SearchParams {
  q: string;
  type?: SearchType | SearchType[];
  page?: number;
  limit?: number;
}

