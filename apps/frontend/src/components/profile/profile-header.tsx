'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/profile';
import { SocialLinks } from './social-links';
import { Edit } from '@/components/ui/hugeicons';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';

interface ProfileHeaderProps {
  profile: UserProfile;
  userId: string;
}

export function ProfileHeader({ profile, userId }: ProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <header className="pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || 'User'} />
          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{profile.display_name || 'User'}</h1>
          {profile.bio && <p className="text-muted-foreground mb-2">{profile.bio}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.location && <span>{profile.location}</span>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          {profile.social_links && profile.social_links.length > 0 && (
            <div className="mt-4">
              <SocialLinks socialLinks={profile.social_links} />
            </div>
          )}
        </div>
        {isOwnProfile && (
          <Button render={<Link href="/profile/edit"><Edit className="h-4 w-4 mr-2" />Edit Profile</Link>} />
        )}
      </div>
    </header>
  );
}
