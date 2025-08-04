import { describe, expect, it } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate environment is working', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
