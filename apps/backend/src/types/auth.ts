import { UserId } from './note';

export interface User {
  id: UserId;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  userId: UserId;
  email: string;
  iat: number;
  exp: number;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: UserId;
    email: string;
  };
}

