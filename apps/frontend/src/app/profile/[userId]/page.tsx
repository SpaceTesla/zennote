'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Skeleton } from '@/components/ui/skeleton';
import { profilesApi } from '@/lib/api/profiles';
import { notesApi } from '@/lib/api/notes';
import { UserProfile } from '@/types/profile';
import { Note } from '@/types/note';
import { NoteList } from '@/components/notes/note-list';
import { useAuth } from '@/lib/hooks/use-auth';
import { PaginationMeta } from '@/types/api';

export const runtime = 'edge';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Redirect if userId is undefined or invalid
  useEffect(() => {
    if (!userId || userId === 'undefined') {
      if (currentUser?.id) {
        router.replace(`/profile/${currentUser.id}`);
      } else {
        router.replace('/');
      }
    }
  }, [userId, currentUser?.id, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || userId === 'undefined') return;
      
      try {
        const data = await profilesApi.getProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (userId && userId !== 'undefined') {
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId || userId === 'undefined') return;
      
      try {
        const response = await notesApi.getNotes({
          userId,
          page: 1,
          limit: 12,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        });
        setNotes(response.data || []);
        setPagination(response.meta?.pagination || null);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    if (userId && userId !== 'undefined') {
      fetchNotes();
    }
  }, [userId]);

  const handlePageChange = (page: number) => {
    setIsLoadingNotes(true);
    notesApi.getNotes({
      userId,
      page,
      limit: 12,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    }).then((response) => {
      setNotes(response.data || []);
      setPagination(response.meta?.pagination || null);
      setIsLoadingNotes(false);
    }).catch((error) => {
      console.error('Failed to fetch notes:', error);
      setIsLoadingNotes(false);
    });
  };

  if (isLoadingProfile) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-4">
        <Skeleton className="h-32 w-full mb-2 rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <p className="text-muted-foreground">Profile not found</p>
      </main>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      <div className="rounded-2xl border border-border/70 bg-white/70 dark:bg-background/70 backdrop-blur-xl shadow-card-ambient p-1">
        <ProfileHeader profile={profile} userId={userId} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isOwnProfile ? 'My Notes' : 'Notes'}
          </h2>
        </div>
        <NoteList
          notes={notes}
          isLoading={isLoadingNotes}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>
    </main>
  );
}

