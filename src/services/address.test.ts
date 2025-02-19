import '../utilities/tests/mocks/smartystreets-javascript-sdk.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddressService from './address.js';

describe('AddressService', () => {
  beforeEach(() => {
    process.env.SMARTY_AUTH_ID = 'test-id';
    process.env.SMARTY_AUTH_TOKEN = 'test-token';
    vi.resetModules();
  });

  describe('validate', () => {
    it('should validate addresses using Smarty service', async () => {
      const service = new AddressService();
      const rows = [
        { Street: '143 e Maine Street', City: 'Columbus', 'Zip Code': '43215' },
      ];

      const results = await service.validate(rows);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        valid: true,
        address: {
          street: '143 e Maine Street',
          city: 'Columbus',
          zipCode: '43215',
        },
        originalAddress: {
          street: '143 e Maine Street',
          city: 'Columbus',
          zipCode: '43215',
        },
      });
    });

    it('should handle invalid addresses', async () => {
      const service = new AddressService();
      const rows = [
        { Street: 'Invalid Street', City: 'Invalid', 'Zip Code': '00000' },
      ];

      const results = await service.validate(rows);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        valid: false,
        originalAddress: {
          street: 'Invalid Street',
          city: 'Invalid',
          zipCode: '00000',
        },
      });
    });

    it('should handle mixed validation results', async () => {
      const service = new AddressService();
      const rows = [
        { Street: '123 Valid St', City: 'Columbus', 'Zip Code': '43215' },
        { Street: '456 Invalid St', City: 'Invalid', 'Zip Code': '43215' },
      ];

      const results = await service.validate(rows);

      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
    });

    it('should handle API errors', async () => {
      const service = new AddressService();
      const rows = [
        { Street: '123 Main St', City: 'Error', 'Zip Code': '43215' },
      ];

      await expect(service.validate(rows)).rejects.toThrow(
        'Error validating addresses: Missing results from Smarty',
      );
    });
  });

  describe('addressToString', () => {
    it('should format an address as a string', () => {
      const address = {
        street: '143 e Maine Street',
        city: 'Columbus',
        zipCode: '43215',
      };

      const result = AddressService.addressToString(address);
      expect(result).toBe('143 e Maine Street, Columbus, 43215');
    });

    it('should handle numeric zip codes', () => {
      const address = {
        street: '143 e Maine Street',
        city: 'Columbus',
        zipCode: 43215,
      };

      const result = AddressService.addressToString(address);
      expect(result).toBe('143 e Maine Street, Columbus, 43215');
    });
  });
});
