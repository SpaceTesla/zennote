import { UserId } from './note';

export interface UserProfile {
  user_id: UserId;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  user_id: UserId;
  platform: string;
  url: string;
  created_at: string;
}

export interface UpdateProfileInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
}

export interface UpdateSocialLinksInput {
  links: Array<{
    platform: string;
    url: string;
  }>;
}

export interface ProfileWithSocials extends UserProfile {
  socials: SocialLink[];
}

