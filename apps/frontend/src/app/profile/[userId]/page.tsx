'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export const runtime = 'edge';

/**
 * Redirect from old /profile/[userId] route to new /[username] route
 * This maintains backward compatibility with old links
 */
export default function ProfileRedirectPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: clerkUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userId || userId === 'undefined') {
      if (clerkUser?.username) {
        router.replace(`/${clerkUser.username}`);
      } else if (clerkUser?.id) {
        router.replace(`/${clerkUser.id}`);
      } else {
        router.replace('/');
      }
      return;
    }

    // Redirect to the new route format
    // The profile API accepts both username and userId, so this will work
    router.replace(`/${userId}`);
  }, [userId, clerkUser?.username, clerkUser?.id, router]);

  return null;
}
