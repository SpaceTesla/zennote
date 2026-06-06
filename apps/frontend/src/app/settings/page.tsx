'use client';

import { useUser, UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import { useProfile, useUpdateProfile, useSettings, useUpdateSettings } from '@/lib/queries/profiles.queries';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { SettingsForm } from '@/components/profile/settings-form';
import { User, Settings as SettingsIcon, Lock } from '@/components/ui/hugeicons';

export const runtime = 'edge';

export default function SettingsPage() {
  const { user } = useUser();
  
  // Queries
  const { data: profile, isLoading: isProfileLoading } = useProfile(user?.username || user?.id || '');
  const { data: settings, isLoading: isSettingsLoading } = useSettings();

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const updateSettingsMutation = useUpdateSettings();

  const handleProfileSubmit = async (data: any) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleSettingsSubmit = async (data: any) => {
    await updateSettingsMutation.mutateAsync(data);
  };

  const isLoading = isProfileLoading || isSettingsLoading || !user;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-48 w-full md:w-60 rounded-lg" />
            <Skeleton className="h-96 flex-1 rounded-lg" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, app configurations, and account security</p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6 items-start">
          <TabsList className="flex md:flex-col w-full md:w-60 bg-muted/20 p-1.5 rounded-lg border border-border/40 md:sticky md:top-20">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 justify-start w-full px-3 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md transition-all cursor-pointer"
            >
              <User className="h-4 w-4" />
              Public Profile
            </TabsTrigger>
            <TabsTrigger 
              value="app-settings" 
              className="flex items-center gap-2 justify-start w-full px-3 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md transition-all cursor-pointer"
            >
              <SettingsIcon className="h-4 w-4" />
              App Settings
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="flex items-center gap-2 justify-start w-full px-3 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md transition-all cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              Security & Account
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full min-w-0">
            <TabsContent value="profile" className="m-0 focus-visible:outline-none">
              <Card className="border border-border/40 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Public Profile</CardTitle>
                  <CardDescription>This information will be displayed publicly on your profile page</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm
                    initialData={
                      profile
                        ? {
                            username: profile.username,
                            display_name: profile.display_name ?? undefined,
                            bio: profile.bio ?? undefined,
                            avatar_url: profile.avatar_url ?? undefined,
                            website_url: profile.website_url ?? undefined,
                            location: profile.location ?? undefined,
                          }
                        : undefined
                    }
                    onSubmit={handleProfileSubmit}
                    isLoading={updateProfileMutation.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="app-settings" className="m-0 focus-visible:outline-none">
              <Card className="border border-border/40 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">App Settings</CardTitle>
                  <CardDescription>Configure your default visibility and privacy choices</CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingsForm
                    initialData={settings ?? undefined}
                    onSubmit={handleSettingsSubmit}
                    isLoading={updateSettingsMutation.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="m-0 focus-visible:outline-none">
              <Card className="border border-border/40 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Security & Account</CardTitle>
                  <CardDescription>Manage your passwords, active sessions, and email connections through Clerk</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full max-w-full overflow-hidden rounded-lg border border-border/40 bg-background">
                    <ClerkUserProfile 
                      routing="hash"
                      appearance={{
                        variables: {
                          colorPrimary: 'hsl(var(--primary))',
                          colorBackground: 'hsl(var(--background))',
                          colorText: 'hsl(var(--foreground))',
                          colorTextSecondary: 'hsl(var(--muted-foreground))',
                        },
                        elements: {
                          cardBox: 'shadow-none border-none w-full max-w-full bg-transparent',
                          navbar: 'border-r border-border/20 max-w-[200px]',
                          scrollBox: 'bg-transparent',
                          pageScrollBox: 'bg-transparent p-4 sm:p-6',
                          headerTitle: 'text-lg font-semibold',
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
