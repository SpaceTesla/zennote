import { UserId } from './note';

export interface User {
  id: UserId;
  email: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

