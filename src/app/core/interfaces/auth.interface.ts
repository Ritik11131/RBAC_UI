export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
  message: string;
  timestamp: number;
  path: string;
}

export interface User {
  id: string;
  entity_id: string;
  email: string;
  mobile_no: string;
  name: string;
  is_active: boolean;
  is_deleted: boolean;
  attributes: {
    password?: string;
  };
  created_by: string;
  creation_time: string;
  last_update_on: string;
  role_id: string;
}

export interface Permission {
  moduleId: string;
  name: string;
  read: boolean;
  write: boolean;
}

export interface DecodedToken {
  userId: string;
  entityId: string;
  roleId: string;
  email: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

