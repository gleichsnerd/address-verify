import mockStdin from '../utilities/tests/mock-stdin.js';
import AddressParser from './address-parser.js';
import fs from 'fs';
import path from 'path';

describe('AddressParser', () => {
  describe('parseFromFile', () => {
    let parser: AddressParser;

    beforeEach(() => {
      parser = new AddressParser();
    });

    it('should parse valid address files', async () => {
      const testFile = path.join(__dirname, '__fixtures__/valid.csv');
      const result = await parser.parseFromCSV(testFile);

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
        await parser.parseFromCSV(testFile);
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
        await parser.parseFromCSV(testFile);
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
        await parser.parseFromCSV(testFile);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });
  });
  describe('parseFromPipe', () => {
    let parser: AddressParser;

    beforeEach(() => {
      parser = new AddressParser();
    });

    it('should parse valid address files', async () => {
      const testFile = path.join(__dirname, '__fixtures__/valid.csv');
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      const result = await parser.parseFromPipe(process.stdin);

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
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      try {
        await parser.parseFromPipe(process.stdin);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });

    it('should reject on missing columns', async () => {
      const testFile = path.join(__dirname, '__fixtures__/missing-column.csv');
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      try {
        await parser.parseFromPipe(process.stdin);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });

    it('should reject on missing header', async () => {
      const testFile = path.join(__dirname, '__fixtures__/no-headers.csv');
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      try {
        await parser.parseFromPipe(process.stdin);
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });
  });
});
