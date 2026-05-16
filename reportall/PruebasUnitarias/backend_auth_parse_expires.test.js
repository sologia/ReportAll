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
  sql: mockSql
}));

let parseExpiresToSeconds;
beforeAll(async () => {
  ({ parseExpiresToSeconds } = await import('../backend/src/Controllers/AuthController.js'));
});

describe('AuthController - parseExpiresToSeconds', () => {
  test('debe interpretar correctamente las cadenas de duración', () => {
    expect(parseExpiresToSeconds('8h')).toBe(28800);
    expect(parseExpiresToSeconds('1d')).toBe(86400);
    expect(parseExpiresToSeconds('30m')).toBe(1800);
    expect(parseExpiresToSeconds('60s')).toBe(60);
    expect(parseExpiresToSeconds('')).toBe(28800);
    expect(parseExpiresToSeconds('123')).toBe(123);
  });

  test('debe usar la duración por defecto para valores inválidos', () => {
    expect(parseExpiresToSeconds('abc')).toBe(28800);
    expect(parseExpiresToSeconds('8x')).toBe(28800);
    expect(parseExpiresToSeconds('-15m')).toBe(28800);
    expect(parseExpiresToSeconds(null)).toBe(28800);
  });
});


