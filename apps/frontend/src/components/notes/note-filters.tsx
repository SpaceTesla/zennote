'use client';

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
          <SelectValue>
            {(value) => {
              if (value === 'updated_at') return 'Last updated';
              if (value === 'created_at') return 'Date created';
              if (value === 'title') return 'Title';
              return 'Sort by';
            }}
          </SelectValue>
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
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {(value) => {
              if (value === 'asc') return 'Ascending';
              if (value === 'desc') return 'Descending';
              return 'Order';
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
