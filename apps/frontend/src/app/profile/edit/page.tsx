'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { profilesApi } from '@/lib/api/profiles';
import { UpdateProfileInput, UserProfile } from '@/types/profile';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile: currentProfile, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await profilesApi.getProfile(user.id);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (data: UpdateProfileInput) => {
    await profilesApi.updateProfile(data);
    await refreshUser();
    router.push(`/profile/${user?.id}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border border-border/70 bg-white/75 dark:bg-background/70 backdrop-blur-xl shadow-card-ambient">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditForm
              initialData={
                profile
                  ? {
                      display_name: profile.display_name ?? undefined,
                      bio: profile.bio ?? undefined,
                      avatar_url: profile.avatar_url ?? undefined,
                      website: profile.website ?? undefined,
                      location: profile.location ?? undefined,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}

