import { BaseRow } from './row-parser.js';
import CSVParser from './csv-parser.js';
import path from 'path';
import fs from 'fs';
import mockStdin from '../utilities/tests/mock-stdin.js';

interface TestRow extends BaseRow {
  name: string;
  age: string;
}

describe('CSVParser', () => {
  beforeEach(() => {
    process.stdin.isTTY = true;
  });

  describe('isCSVFile', () => {
    it('should return true for .csv files', () => {
      expect(CSVParser.isCSVFile('test.csv')).toBe(true);
      expect(CSVParser.isCSVFile('TEST.CSV')).toBe(true);
    });

    it('should return false for non-csv files', () => {
      expect(CSVParser.isCSVFile('test.txt')).toBe(false);
      expect(CSVParser.isCSVFile('test.csv.md')).toBe(false);
    });
  });

  describe('isPipeData', () => {
    it('should return true for piped data', () => {
      process.stdin.isTTY = false;
      expect(CSVParser.isPipeData()).toBe(true);
      process.stdin.isTTY = true;
    });

    it('should return false if no data is being piped', () => {
      expect(CSVParser.isPipeData()).toBe(false);
    });
  });

  describe('parseFromCSV', () => {
    let parser: CSVParser<TestRow>;

    beforeEach(() => {
      parser = new CSVParser<TestRow>();
    });

    it('should parse any CSV if no schema is present', async () => {
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/valid.csv',
      );
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

    it('should parse a valid CSV if schema is present', async () => {
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/valid.csv',
      );
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

    it('should accept an empty CSV as valid regardless of schema', async () => {
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/empty.csv',
      );
      const result = await parser.parseFromCSV(testFile);

      expect(result).toEqual([]);
    });

    it('should reject on extra columns', async () => {
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/extra-column.csv',
      );

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
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/missing-column.csv',
      );

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
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/no-headers.csv',
      );

      await expect(parser.parseFromCSV(testFile)).rejects.toThrow(
        'column header mismatch expected: 0 columns got: 3',
      );
    });
  });

  describe('parseFromPipe', () => {
    let parser: CSVParser<TestRow>;

    beforeEach(() => {
      parser = new CSVParser<TestRow>();
    });

    it('should parse a valid piped csv file', async () => {
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/valid.csv',
      );
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      const result = await parser.parseFromPipe(process.stdin);

      expect(result).toEqual([
        { City: 'Columbus', Street: '143 e Maine Street', 'Zip Code': '43215' },
        { City: 'Title', Street: '1 Empora St', 'Zip Code': '11111' },
      ]);
    });

    it('should handle empty pipe data', async () => {
      mockStdin('');
      const result = await parser.parseFromPipe();
      expect(result).toEqual([]);
    });

    it('should reject when stdin has an error', async () => {
      process.nextTick(() => {
        process.stdin.emit('error', new Error('Stdin error'));
      });

      await expect(parser.parseFromPipe()).rejects.toThrow('Stdin error');
    });

    it('should reject on extra columns in pipe-separated file', async () => {
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/extra-column.csv',
      );
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      try {
        await parser.parseFromPipe();
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });

    it('should reject on missing columns in pipe-separated file', async () => {
      class TestParser extends CSVParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(
        __dirname,
        '../utilities/tests/fixtures/csv/missing-column.csv',
      );
      const fileContents = fs.readFileSync(testFile, 'utf8');
      mockStdin(fileContents);

      try {
        await parser.parseFromPipe();
        // We should never hit this line, so we fail the test if we do
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid schema');
      }
    });
  });
});
