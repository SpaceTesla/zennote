'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotesQueryParams } from '@/types/note';

interface NoteFiltersProps {
  filters: NotesQueryParams;
  onFiltersChange: (filters: Partial<NotesQueryParams>) => void;
}

export function NoteFilters({ filters, onFiltersChange }: NoteFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={filters.sortBy || 'updated_at'}
        onValueChange={(value) =>
          onFiltersChange({ sortBy: value as NotesQueryParams['sortBy'] })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated_at">Last Updated</SelectItem>
          <SelectItem value="created_at">Date Created</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortOrder || 'desc'}
        onValueChange={(value) =>
          onFiltersChange({ sortOrder: value as 'asc' | 'desc' })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

