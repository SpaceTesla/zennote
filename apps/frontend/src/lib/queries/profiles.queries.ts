import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles';
import { UpdateProfileInput, UpdateSettingsInput } from '@/types/profile';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
  settings: () => [...profileKeys.all, 'settings'] as const,
};

export function useProfile(userIdOrUsername: string) {
  return useQuery({
    queryKey: profileKeys.detail(userIdOrUsername),
    queryFn: () => profilesApi.getProfile(userIdOrUsername),
    enabled: !!userIdOrUsername,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profilesApi.updateProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(data.user_id), data);
      queryClient.setQueryData(profileKeys.detail(data.username), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: profileKeys.settings(),
    queryFn: () => profilesApi.getSettings(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => profilesApi.updateSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.settings(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
