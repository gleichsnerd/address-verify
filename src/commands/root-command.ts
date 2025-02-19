import AddressParser, { AddressRow } from '../parsers/address-parser.js';
import CSVParser from '../parsers/csv-parser.js';
import SmartyService from '../services/smarty.js';
import AddressService from '../services/address.js';
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

    if (!SmartyService.validateEnvironment()) {
      console.error(
        'Missing required environment variables SMARTY_AUTH_ID and SMARTY_AUTH_TOKEN',
      );
      return;
    }

    let data: AddressRow[] = [];
    // If we have piped input, then we need to handle it
    if (CSVParser.isPipeData()) {
      console.log('Reading piped input');
      const parser = new AddressParser();
      data = await parser.parseFromPipe();
    } else if (args.filename && CSVParser.isCSVFile(args.filename as string)) {
      console.log(`Reading provided file: ${args.filename}`);
      const parser = new AddressParser();
      data = await parser.parseFromCSV(args.filename as string);
    } else if (args.filename) {
      console.log(
        `Invalid filename \`${args.filename}\`. Use --help for usage.`,
      );
      return;
    } else {
      console.log('No valid input provided. Use --help for usage.');
      return;
    }

    console.log(`${data.length} addresses to validate`);
    const addressService = new AddressService();
    const results = await addressService.validate(data);

    console.log(''); // Newline for readability
    for (const result of results) {
      const originalAddress = AddressService.addressToString(
        result.originalAddress,
      );
      if (result.valid) {
        const validatedAddress = AddressService.addressToString(result.address);
        console.log(`${originalAddress} -> ${validatedAddress}`);
      } else {
        console.log(`${originalAddress} -> Invalid Address`);
      }
    }
  }
}

export default RootCommand;
