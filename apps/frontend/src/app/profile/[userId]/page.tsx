'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profilesApi.getProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    const fetchNotes = async () => {
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

    if (userId) {
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

  const isOwnProfile = currentUser?.id === userId;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeader profile={profile} userId={userId} />
      
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          {isOwnProfile ? 'My Notes' : 'Notes'}
        </h2>
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

