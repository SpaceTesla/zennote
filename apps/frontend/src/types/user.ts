export interface User {
  id: string;
  email: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  default_visibility: 'private' | 'unlisted' | 'public';
  allow_search_index: boolean;
  show_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthMeResponse {
  user: User;
  profile: UserProfile | null;
  settings: UserSettings | null;
}

