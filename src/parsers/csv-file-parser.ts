import fs from 'fs';
import { parse } from 'fast-csv';
import path from 'path';

export interface BaseCSVRow {
  [key: string]: unknown;
}

/**
 * CSVFileParser: A generic CSV file parser that can be extended to enforce schema
 *
 * *Developer's Note:*
 * This class is designed to wrap whatever CSV parsing code we want to use and add
 * extra functionality like schema validation. This allows us to easily extend adapt
 * to different CSV formats while enforcing data integrity.
 */
class CSVFileParser<Row extends BaseCSVRow> {
  protected schema: string[] = [];
  public static isCSVFile(filename: string): boolean {
    // This is a naive check if a given filename is a csv -- it would be better to validate
    // the actual content, but for the sake of this project we will consider that out of scope
    return filename.toLocaleLowerCase().endsWith('.csv');
  }

  public validateSchema(row: Row): boolean {
    // If we have no schema to enforce, then assume any field is allowed
    if (this.schema.length === 0) {
      return true;
    }

    const keys = Object.keys(row) as typeof this.schema;

    // Future improvements: Allow configuring whether we want strict schema versus minimum schema,
    // as well as enforcing value types.
    const hasOnlySchemaKeys = keys.every((key) => this.schema.includes(key));
    const hasAllSchemaKeys = this.schema.every((key) => keys.includes(key));
    return hasOnlySchemaKeys && hasAllSchemaKeys;
  }

  public async parse(filename: string): Promise<Row[]> {
    let filepath = path.join(process.cwd(), filename);
    // If we already have a full path, just use that
    if (path.isAbsolute(filename)) {
      filepath = filename;
    }

    return new Promise((resolve, reject) => {
      const csvData: Row[] = [];
      const readStream = fs.createReadStream(filepath);
      const csvStream = parse({ headers: true, trim: true });
      readStream.pipe(csvStream);
      csvStream.on('data', (row) => {
        if (!this.validateSchema(row as Row)) {
          reject(new Error('Invalid schema'));
        }
        csvData.push(row as Row);
      });
      csvStream.on('end', () => {
        resolve(csvData);
      });
      csvStream.on('error', (error) => {
        reject(error);
      });
    });
  }
}

export default CSVFileParser;
