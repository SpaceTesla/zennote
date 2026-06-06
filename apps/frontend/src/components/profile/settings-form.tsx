'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpdateSettingsInput } from '@/types/profile';
import { toast } from 'sonner';

const settingsSchema = z.object({
  default_visibility: z.enum(['private', 'unlisted', 'public']),
  allow_search_index: z.boolean(),
  show_profile: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData?: UpdateSettingsInput;
  onSubmit: (data: UpdateSettingsInput) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsForm({
  initialData,
  onSubmit,
  isLoading,
}: SettingsFormProps) {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      default_visibility: initialData?.default_visibility || 'private',
      allow_search_index: initialData?.allow_search_index !== false, // default to true
      show_profile: initialData?.show_profile !== false, // default to true
    },
  });

  const handleSubmit = async (data: SettingsFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // toast is already handled in mutation
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="default_visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Note Visibility</FormLabel>
              <FormDescription>
                Choose the default visibility when you create a new note
              </FormDescription>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allow_search_index"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-base">Search Indexing</FormLabel>
                <FormDescription>
                  Allow search engines to index your public profile and public notes
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="show_profile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-base">Show Public Profile</FormLabel>
                <FormDescription>
                  Display your profile page and public notes to visitors
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </Form>
  );
}
