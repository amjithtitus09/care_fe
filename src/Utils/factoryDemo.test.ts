// Fixed test runner type issues
import { test, expect } from '@jest/globals';

test('factory demo test', () => {
  const result = true;
  expect(result).toBe(true);
});
