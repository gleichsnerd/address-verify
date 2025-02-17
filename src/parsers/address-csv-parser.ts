import CSVFileParser, { BaseCSVRow } from './csv-file-parser.js';

export interface AddressCSVRow extends BaseCSVRow {
  Street: string;
  City: string;
  'Zip Code': string | number;
}

class AddressCSVParser extends CSVFileParser<AddressCSVRow> {
  schema = ['Street', 'City', 'Zip Code'];
}

export default AddressCSVParser;
