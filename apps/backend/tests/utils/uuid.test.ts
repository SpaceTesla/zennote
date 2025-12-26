import { describe, it, expect } from 'vitest';
import { generateUUID } from '../../src/utils/uuid';

describe('UUID Utils', () => {
  it('should generate a valid UUID', () => {
    const uuid = generateUUID();
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});

