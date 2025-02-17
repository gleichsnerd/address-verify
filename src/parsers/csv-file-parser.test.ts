import CSVFileParser, { BaseCSVRow } from './csv-file-parser.js';
import path from 'path';

interface TestRow extends BaseCSVRow {
  name: string;
  age: string;
}

describe('CSVFileParser', () => {
  describe('isCSVFile', () => {
    it('should return true for .csv files', () => {
      expect(CSVFileParser.isCSVFile('test.csv')).toBe(true);
      expect(CSVFileParser.isCSVFile('TEST.CSV')).toBe(true);
    });

    it('should return false for non-csv files', () => {
      expect(CSVFileParser.isCSVFile('test.txt')).toBe(false);
      expect(CSVFileParser.isCSVFile('test.csv.md')).toBe(false);
    });
  });

  describe('validateSchema', () => {
    let parser: CSVFileParser<TestRow>;

    beforeEach(() => {
      parser = new CSVFileParser<TestRow>();
    });

    it('should return true when no schema is defined', () => {
      const row = { name: 'John', age: '30' };
      expect(parser.validateSchema(row)).toBe(true);
    });

    it('should validate against defined schema', () => {
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['name', 'age'];
      }
      const parser = new TestParser();
      const validRow = { name: 'John', age: '30' };
      const invalidRow = { name: 'John', invalid: 'field' };

      expect(parser.validateSchema(validRow)).toBe(true);
      // @ts-expect-error We enforce valid rows at the TS level based on schema as well
      expect(parser.validateSchema(invalidRow)).toBe(false);
    });
  });

  describe('parse', () => {
    let parser: CSVFileParser<TestRow>;

    beforeEach(() => {
      parser = new CSVFileParser<TestRow>();
    });

    it('should parse any CSV if no schema is present', async () => {
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

    it('should parse a valid CSV if schema is present', async () => {
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
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

    it('should accept an empty CSV as valid regardless of schema', async () => {
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
      const testFile = path.join(__dirname, '__fixtures__/empty.csv');
      const result = await parser.parse(testFile);

      expect(result).toEqual([]);
    });

    it('should reject on extra columns', async () => {
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
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
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
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
      class TestParser extends CSVFileParser<TestRow> {
        schema = ['Street', 'City', 'Zip Code'];
      }
      const parser = new TestParser();
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
