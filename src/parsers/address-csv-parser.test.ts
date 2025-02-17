import AddressCSVParser from './address-csv-parser.js';
import path from 'path';

describe('AddressCSVParser', () => {
  describe('parse', () => {
    let parser: AddressCSVParser;

    beforeEach(() => {
      parser = new AddressCSVParser();
    });

    it('should parse valid address files', async () => {
      const testFile = path.join(__dirname, '__fixtures__/valid.csv');
      const result = await parser.parse(testFile);

      expect(result).toEqual([
        { City: 'Columbus', Street: '143 e Maine Street', 'Zip Code': '43215' },
        {
          City: 'Title',
          Street: '1 Empora St',
          'Zip Code': '11111',
        },
      ]);
    });

    it('should reject on extra columns', async () => {
      const testFile = path.join(__dirname, '__fixtures__/extra-column.csv');

      try {
        await parser.parse(testFile);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });

    it('should reject on missing columns', async () => {
      const testFile = path.join(__dirname, '__fixtures__/missing-column.csv');

      try {
        await parser.parse(testFile);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });

    it('should reject on missing header', async () => {
      const testFile = path.join(__dirname, '__fixtures__/no-headers.csv');

      try {
        await parser.parse(testFile);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });
  });
});
