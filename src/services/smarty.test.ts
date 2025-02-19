import '../utilities/tests/mocks/smartystreets-javascript-sdk.js';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import SmartyService, { type Address } from './smarty.js';

describe('SmartyService', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SMARTY_AUTH_ID: 'test-id',
      SMARTY_AUTH_TOKEN: 'test-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a SmartyService instance when env vars are present', () => {
    const service = new SmartyService();
    expect(service).toBeInstanceOf(SmartyService);
  });

  it('should throw when env vars are missing', () => {
    delete process.env.SMARTY_AUTH_ID;
    delete process.env.SMARTY_AUTH_TOKEN;
    expect(() => new SmartyService()).toThrow(
      'Missing required environment variables',
    );
  });

  describe('formatting', () => {
    it('should format a street correctly', () => {
      const service = new SmartyService();
      const fullLookup = {
        components: {
          primaryNumber: '123',
          streetPredirection: 'N',
          streetName: 'Main',
          streetSuffix: 'St',
          streetPostdirection: 'SE',
        },
      };
      const fullStreet = service.formatStreet(fullLookup);
      expect(fullStreet).toBe('123 N Main St SE');

      const partialLookup = {
        components: {
          primaryNumber: '1',
          streetName: 'Main',
          streetSuffix: 'St',
        },
      };
      const partialStreet = service.formatStreet(partialLookup);
      expect(partialStreet).toBe('1 Main St');
    });

    it('should format a city correctly', () => {
      const service = new SmartyService();
      const fullLookup = {
        components: {
          cityName: 'New York',
          state: 'NY',
          urbanization: 'Manhattan',
        },
      };
      const formattedCity = service.formatCity(fullLookup);
      expect(formattedCity).toBe('New York');
    });

    it('should format a zip code correctly', () => {
      const service = new SmartyService();
      const fullLookup = {
        components: {
          zipCode: '10001',
          plus4Code: '1234',
        },
      };
      const formattedZipCode = service.formatZipCode(fullLookup);
      expect(formattedZipCode).toBe('10001-1234');

      const partialLookup = {
        components: {
          zipCode: '10001',
        },
      };
      const partialZipCode = service.formatZipCode(partialLookup);
      expect(partialZipCode).toBe('10001');
    });
  });

  it('should validate a single valid address', async () => {
    const service = new SmartyService();
    const address: Address = {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
    };

    const result = await service.validateAddress(address);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.address).toEqual({
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
      });
      expect(result.originalAddress).toEqual(address);
    }
  });

  it('should validate multiple addresses in batches', async () => {
    const service = new SmartyService();
    const addresses: Address[] = [
      {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
      },
      {
        street: '456 Broadway',
        city: 'New York',
        zipCode: '10013',
      },
    ];

    const results = await service.validateAddresses(addresses);

    expect(results).toHaveLength(2);
    results.forEach((result, index) => {
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.originalAddress).toEqual(addresses[index]);
      }
    });
  });

  it('should handle invalid addresses', async () => {
    const service = new SmartyService();
    const address: Address = {
      street: 'Invalid Street',
      city: 'Invalid',
      zipCode: '10001',
    } as Address;

    const result = await service.validateAddress(address);

    expect(result.valid).toBe(false);
    expect(result.originalAddress).toEqual(address);
  });

  it('should abort on API failure', async () => {
    const service = new SmartyService();
    const address: Address = {
      street: 'Error Street',
      city: 'Error',
      zipCode: '10001',
    } as Address;

    await expect(service.validateAddress(address)).rejects.toThrow();
  });

  it('should handle addresses with ZIP+4 codes', async () => {
    const service = new SmartyService();
    const address: Address = {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001-1234',
    };

    const result = await service.validateAddress(address);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.address.zipCode).toBe('10001-1234');
    }
  });
});
