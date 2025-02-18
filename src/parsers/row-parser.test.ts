import RowParser, { BaseRow } from './row-parser.js';

interface TestRow extends BaseRow {
  name: string;
  age: string;
}

class TestParserNoSchema extends RowParser<TestRow> {
  schema = [];
}
class TestParserWithSchema extends RowParser<TestRow> {
  schema = ['name', 'age'];
}

describe('RowParser', () => {
  beforeEach(() => {
    process.stdin.isTTY = true;
  });

  describe('validateSchema', () => {
    let parser: TestParserNoSchema;

    beforeEach(() => {
      parser = new TestParserNoSchema();
    });

    it('should return true when no schema is defined', () => {
      const row = { name: 'John', age: '30' };
      expect(parser.validateSchema(row)).toBe(true);
    });

    it('should validate against defined schema', () => {
      const parser = new TestParserWithSchema();
      const validRow = { name: 'John', age: '30' };
      const missingColumnRow = { name: 'John' };
      const extraColumnRow = { name: 'John', age: '30', extra: 'extraValue' };

      expect(parser.validateSchema(validRow)).toBe(true);
      // @ts-expect-error We enforce valid rows at the TS level based on schema as well
      expect(parser.validateSchema(missingColumnRow)).toBe(false);
      expect(parser.validateSchema(extraColumnRow)).toBe(false);
    });
  });
});
