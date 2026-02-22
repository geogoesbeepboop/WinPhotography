import { UserRole } from '../enums';

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}
