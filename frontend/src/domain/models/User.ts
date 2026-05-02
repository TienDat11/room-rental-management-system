export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
}

export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";
export type RegistrationRole = Exclude<UserRole, "ADMIN">;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  phone?: string;
  role: RegistrationRole;
}

export interface UserCreateRequest extends Omit<RegisterRequest, "role"> {
  role: UserRole;
}

export interface UserUpdateRequest {
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}
