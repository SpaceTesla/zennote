import { createClerkClient } from '@clerk/backend';
import { Env } from '../types/env';

export interface ClerkUserData {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

/**
 * Get Clerk client instance
 */
export function getClerkClient(secretKey: string) {
  return createClerkClient({ secretKey });
}

/**
 * Fetch user details from Clerk API
 */
export async function fetchClerkUserData(
  clerkUserId: string,
  secretKey: string
): Promise<ClerkUserData | null> {
  try {
    const clerkClient = getClerkClient(secretKey);
    const user = await clerkClient.users.getUser(clerkUserId);

    if (!user) {
      return null;
    }

    // Get primary email address
    const primaryEmail = user.emailAddresses?.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';

    return {
      id: user.id,
      email: primaryEmail,
      username: user.username || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      imageUrl: user.imageUrl || null,
    };
  } catch (error) {
    console.error('[Clerk] Error fetching user data:', error);
    return null;
  }
}

