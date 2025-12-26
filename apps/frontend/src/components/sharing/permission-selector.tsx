'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionLevel } from '@/types/note';

interface PermissionSelectorProps {
  value: PermissionLevel;
  onChange: (value: PermissionLevel) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  value,
  onChange,
  disabled,
}: PermissionSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="read">Read - View only</SelectItem>
        <SelectItem value="write">Write - View and edit</SelectItem>
        <SelectItem value="admin">Admin - Full control</SelectItem>
      </SelectContent>
    </Select>
  );
}

