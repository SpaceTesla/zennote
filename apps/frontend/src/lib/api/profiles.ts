import { apiClient } from './client';
import { config } from '@/config';
import { StandardResponse } from '@/types/api';
import { UserProfile, UpdateProfileInput, UpdateSocialLinksInput } from '@/types/profile';

export const profilesApi = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(
      config.api.endpoints.profiles.get(userId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch profile');
    }

    return response.data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>(
      config.api.endpoints.profiles.update,
      input
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }

    return response.data;
  },

  async updateSocialLinks(input: UpdateSocialLinksInput): Promise<void> {
    const response = await apiClient.put<void>(
      config.api.endpoints.profiles.updateSocials,
      input
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update social links');
    }
  },
};

