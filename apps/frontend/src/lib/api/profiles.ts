import { apiClient } from './client';
import { config } from '@/config';
import { UserProfile, UpdateProfileInput, UserSettings, UpdateSettingsInput } from '@/types/profile';

export const profilesApi = {
  async getProfile(userIdOrUsername: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(
      config.api.endpoints.profiles.get(userIdOrUsername)
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

  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get<UserSettings>(
      config.api.endpoints.settings.me
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch settings');
    }

    return response.data;
  },

  async updateSettings(input: UpdateSettingsInput): Promise<UserSettings> {
    const response = await apiClient.put<UserSettings>(
      config.api.endpoints.settings.me,
      input
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update settings');
    }

    return response.data;
  },
};
