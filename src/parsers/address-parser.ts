import { BaseRow } from './row-parser.js';
import CSVParser from './csv-parser.js';

export interface AddressRow extends BaseRow {
  Street: string;
  City: string;
  'Zip Code': string | number;
}

/**
 * AddressCSVFileParser: A parser for address CSV files
 */
class AddressParser extends CSVParser<AddressRow> {
  schema = ['Street', 'City', 'Zip Code'];
}

export default AddressParser;
