import { jest } from '@jest/globals';

const mockSql = {
  NVarChar: jest.fn((len) => ({ type: 'NVarChar', length: len })),
  Int: jest.fn((len) => ({ type: 'Int', length: len })),
  Date: jest.fn(() => ({ type: 'Date' })),
};

jest.mock('../backend/src/config/db.js', () => ({
  poolPromise: Promise.resolve({
    request: jest.fn().mockReturnThis(),
    input: jest.fn().mockReturnThis(),
    execute: jest.fn()
  }),
  sql: mockSql,
}));

const { parseExpiresToSeconds } = await import('../backend/src/Controllers/AuthController.js');

describe('AuthController - parseExpiresToSeconds', () => {
  test('should parse duration strings correctly', () => {
    expect(parseExpiresToSeconds('8h')).toBe(28800);
    expect(parseExpiresToSeconds('1d')).toBe(86400);
    expect(parseExpiresToSeconds('30m')).toBe(1800);
    expect(parseExpiresToSeconds('60s')).toBe(60);
    expect(parseExpiresToSeconds('')).toBe(28800);
    expect(parseExpiresToSeconds('123')).toBe(123);
  });


