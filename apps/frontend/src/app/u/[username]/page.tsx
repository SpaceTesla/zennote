'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Skeleton } from '@/components/ui/skeleton';
import { profilesApi } from '@/lib/api/profiles';
import { notesApi } from '@/lib/api/notes';
import { UserProfile } from '@/types/profile';
import { Note } from '@/types/note';
import { NoteList } from '@/components/notes/note-list';
import { PaginationMeta } from '@/types/api';

export const runtime = 'edge';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username || username === 'undefined') return;

      try {
        const data = await profilesApi.getProfile(username);
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (username && username !== 'undefined') {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!profile || !profile.user_id) return;

      try {
        const response = await notesApi.getNotes({
          userId: profile.user_id,
          page: 1,
          limit: 12,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        });
        const publicNotes = (response.data || []).filter(
          (note) => note.visibility === 'public'
        );
        setNotes(publicNotes);
        setPagination(response.meta?.pagination || null);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    if (profile?.user_id) {
      fetchNotes();
    }
  }, [profile]);

  const handlePageChange = (page: number) => {
    if (!profile?.user_id) return;

    setIsLoadingNotes(true);
    notesApi
      .getNotes({
        userId: profile.user_id,
        page,
        limit: 12,
        sortBy: 'updated_at',
        sortOrder: 'desc',
      })
      .then((response) => {
        const publicNotes = (response.data || []).filter(
          (note) => note.visibility === 'public'
        );
        setNotes(publicNotes);
        setPagination(response.meta?.pagination || null);
        setIsLoadingNotes(false);
      })
      .catch((error) => {
        console.error('Failed to fetch notes:', error);
        setIsLoadingNotes(false);
      });
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-4">
        <Skeleton className="h-24 w-full mb-2 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = !!clerkUser && clerkUser.id === profile.user_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        <header className="max-w-5xl mx-auto">
          <ProfileHeader profile={profile} username={username} />
        </header>

        <section className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              {isOwnProfile ? 'Published notes' : 'Published notes'}
            </h2>
          </div>
          <NoteList
            notes={notes}
            isLoading={isLoadingNotes}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </section>
      </div>
    </div>
  );
}
