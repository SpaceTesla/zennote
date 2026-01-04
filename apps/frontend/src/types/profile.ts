export interface SocialLink {
  platform: string;
  url: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  location: string | null;
  social_links: SocialLink[] | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  location?: string;
}

export interface UserSettings {
  user_id: string;
  default_visibility: 'private' | 'unlisted' | 'public';
  allow_search_index: boolean;
  show_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  default_visibility?: 'private' | 'unlisted' | 'public';
  allow_search_index?: boolean;
  show_profile?: boolean;
}

