import fs from 'fs';
import { parse } from 'fast-csv';
import path from 'path';
import RowParser, { BaseRow } from './row-parser.js';

/**
 * CSVParser: A generic CSV data parser for files or piped input that can be extended
 * to enforce schema.
 *
 * *Developer's Note:*
 * This class is designed to wrap whatever CSV parsing code we want to use and inherits
 * extra functionality like schema validation. This allows us to easily extend and adapt
 * to different CSV formats while enforcing data integrity.
 */
class CSVParser<Row extends BaseRow> extends RowParser<Row> {
  protected schema: string[] = [];
  public static isCSVFile(filename: string): boolean {
    // This is a naive check if a given filename is a csv -- it would be better to validate
    // the actual content, but for the sake of this project we will consider that out of scope
    return filename.toLowerCase().endsWith('.csv');
  }

  public static isPipeData(): boolean {
    return !process.stdin.isTTY;
  }

  public async parseFromCSV(filename: string): Promise<Row[]> {
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

  async parseFromPipe(
    stdin: typeof process.stdin = process.stdin,
  ): Promise<Row[]> {
    const pipeInput = await this.getPipeInput(stdin);
    const data = await this.parsePipeInput(pipeInput);
    return data;
  }

  protected getPipeInput(
    stdin: typeof process.stdin = process.stdin,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      stdin.setEncoding('utf8');
      stdin.on('data', (chunk) => {
        data += chunk;
      });
      stdin.on('end', () => {
        resolve(data);
      });
      stdin.on('error', (error) => {
        reject(error);
      });
    });
  }

  protected checkHeadersAgainstSchema(headers: string[]): boolean {
    const headersObj = headers.reduce(
      (obj, header) => {
        obj[header] = true;
        return obj;
      },
      {} as Record<string, boolean>,
    );

    return this.validateSchema(headersObj as Row);
  }

  protected async parsePipeInput(data: string): Promise<Row[]> {
    // Split input into lines and parse as CSV
    const lines = data.trim().split('\n');
    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
      return [];
    }

    const headers = lines[0].split(',').map((h) => h.trim());

    if (!this.checkHeadersAgainstSchema(headers)) {
      throw new Error('Invalid schema');
    }

    const rows = lines.slice(1).map(
      (line) => {
        const values = line.split(',').map((v) => v.trim());
        if (values.length !== headers.length) {
          throw new Error('Invalid schema');
        }

        const row: Row = headers.reduce(
          (obj, header, i) => {
            obj[header] = values[i] !== undefined ? values[i] : null;
            return obj;
          },
          {} as Record<string, unknown>,
        ) as Row;
        return row;
      },
      {} as Record<string, unknown>,
    );

    return rows;
  }
}

export default CSVParser;
