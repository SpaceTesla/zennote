'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Skeleton } from '@/components/ui/skeleton';
import { profilesApi } from '@/lib/api/profiles';
import { UserProfile } from '@/types/profile';
import { useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profilesApi.getProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Profile not found</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeader profile={profile} userId={userId} />
    </main>
  );
}

