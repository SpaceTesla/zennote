import { describe, it, expect } from 'vitest';
import {
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
} from '../../src/schemas/note.schema';

describe('Note Schemas', () => {
  describe('createNoteSchema', () => {
    it('should validate a valid note creation input', () => {
      const input = {
        title: 'Test Note',
        content: 'Test content',
        is_public: false,
      };

      const result = createNoteSchema.parse(input);
      expect(result.title).toBe('Test Note');
      expect(result.content).toBe('Test content');
      expect(result.is_public).toBe(false);
    });

    it('should default is_public to false', () => {
      const input = {
        title: 'Test Note',
        content: 'Test content',
      };

      const result = createNoteSchema.parse(input);
      expect(result.is_public).toBe(false);
    });

    it('should reject empty title', () => {
      const input = {
        title: '',
        content: 'Test content',
      };

      expect(() => createNoteSchema.parse(input)).toThrow();
    });

    it('should reject title longer than 500 characters', () => {
      const input = {
        title: 'a'.repeat(501),
        content: 'Test content',
      };

      expect(() => createNoteSchema.parse(input)).toThrow();
    });
  });

  describe('updateNoteSchema', () => {
    it('should validate partial update', () => {
      const input = {
        title: 'Updated Title',
      };

      const result = updateNoteSchema.parse(input);
      expect(result.title).toBe('Updated Title');
    });

    it('should allow empty update object', () => {
      const input = {};
      const result = updateNoteSchema.parse(input);
      expect(result).toEqual({});
    });
  });

  describe('shareNoteSchema', () => {
    it('should validate share input', () => {
      const input = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        permission_level: 'read',
      };

      const result = shareNoteSchema.parse(input);
      expect(result.user_id).toBe(input.user_id);
      expect(result.permission_level).toBe('read');
    });

    it('should accept valid permission levels', () => {
      const levels = ['read', 'write', 'admin'] as const;

      levels.forEach((level) => {
        const input = {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          permission_level: level,
        };

        const result = shareNoteSchema.parse(input);
        expect(result.permission_level).toBe(level);
      });
    });

    it('should reject invalid permission level', () => {
      const input = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        permission_level: 'invalid',
      };

      expect(() => shareNoteSchema.parse(input)).toThrow();
    });
  });
});

