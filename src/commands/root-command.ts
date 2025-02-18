import AddressParser from '../parsers/address-parser.js';
import CSVParser from '../parsers/csv-parser.js';
import BaseCommand from './base-command.js';
import { ArgumentsCamelCase } from 'yargs';

/**
 * RootCommand: Handles commands without command names
 *
 * Supports both piped input and direct filename input
 * Usage:
 *   - cat file.csv | address-verify
 *   - address-verify file.csv
 *
 * *Developer's Note:*
 * Since both piped input and filename input are considered "root" commands,
 * we have to check the input args to subhandle as well as deflect if we're
 * give invalid filenames or keywords.
 *
 * @extends BaseCommand
 */
class RootCommand extends BaseCommand {
  command = '$0 [filename]';
  describe =
    'Validates addresses for piped-in CSV files or provided CSV filename';

  async handler(args: ArgumentsCamelCase): Promise<void> {
    // Special considerations for the root command
    // If we have more than one params, then we're not this handler
    if (args?._?.length > 1) {
      return;
    }

    // If we have piped input, then we need to handle it
    if (CSVParser.isPipeData()) {
      console.log('Reading piped input');
      const parser = new AddressParser();
      const data = await parser.parseFromPipe();
      console.log(`${data.length} addresses to validate`);
      // TODO: Validate addresses
      return;
    } else if (args.filename && CSVParser.isCSVFile(args.filename as string)) {
      console.log(`Reading provided file: ${args.filename}`);
      const parser = new AddressParser();
      const data = await parser.parseFromCSV(args.filename as string);
      console.log(`${data.length} addresses to validate`);
      // TODO: Validate addresses
      return;
    } else if (args.filename) {
      console.log(
        `Invalid filename \`${args.filename}\`. Use --help for usage.`,
      );
    } else {
      console.log('No valid input provided. Use --help for usage.');
    }
  }
}

export default RootCommand;
