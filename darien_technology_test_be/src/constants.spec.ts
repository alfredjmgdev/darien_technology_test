import { PORT, SERVICE_NAME, CORS_CONFIG } from './constants';

describe('Constants', () => {
  describe('PORT', () => {
    it('should be 3001', () => {
      expect(PORT).toBe(3001);
    });
  });

  describe('SERVICE_NAME', () => {
    it('should be "Darien Technology Test"', () => {
      expect(SERVICE_NAME).toBe('Darien Technology Test');
    });
  });

  describe('CORS_CONFIG', () => {
    it('should have the correct methods', () => {
      expect(CORS_CONFIG.methods).toEqual([
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
      ]);
    });

    it('should have the correct origin', () => {
      expect(CORS_CONFIG.origin).toBe('*');
    });

    it('should have credentials set to true', () => {
      expect(CORS_CONFIG.credentials).toBe(true);
    });

    it('should have the expected structure', () => {
      expect(CORS_CONFIG).toEqual({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        origin: '*',
        credentials: true,
      });
    });
  });
});
