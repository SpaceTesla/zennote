import { apiClient } from './client';
import { UserProfile, UserSettings } from '@/types/profile';

export interface DbUser {
  id: string;
  email: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthMeResponse {
  user: DbUser;
  profile: UserProfile | null;
  settings: UserSettings | null;
}

export const authApi = {
  async getMe(): Promise<AuthMeResponse> {
    const response = await apiClient.get<AuthMeResponse>('/v1/auth/me');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch auth state');
    }

    return response.data;
  },
};
