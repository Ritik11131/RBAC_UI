import { PaginationParams, PaginatedResponse } from './module.interface';

/**
 * Meter interface matching API response structure
 */
export interface Meter {
  id: string;
  name: string;
  entity_id: string;
  meter_type?: string;
  attributes?: {
    [key: string]: any;
  };
  tb_ref_id?: string | null;
  tb_token?: string | null;
  created_by?: string;
  creation_time?: string;
  last_update_on?: string;
}

/**
 * Meter creation/update payload
 */
export interface MeterPayload {
  name: string;
  entity_id: string;
  meter_type?: string;
  attributes?: {
    [key: string]: any;
  };
  tb_ref_id?: string | null;
  tb_token?: string | null;
}

/**
 * Query parameters for paginated meter requests
 */
export interface MeterPaginationParams extends PaginationParams {
  entityId?: string; // Filter by entity ID
}

/**
 * Paginated meters response
 */
export interface PaginatedMetersResponse extends PaginatedResponse<Meter> {}

