export type SocialPlatform =
  | 'twitter'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'website'
  | 'other';

export interface SocialLink {
  user_id: string;
  platform: SocialPlatform;
  url: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  social_links?: SocialLink[];
}

export interface UpdateProfileInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
}

export interface UpdateSocialLinksInput {
  socialLinks: Array<{
    platform: SocialPlatform;
    url: string;
  }>;
}

