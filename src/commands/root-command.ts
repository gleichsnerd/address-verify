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
  describe = 'Validates addresses for piped-in CSV files or provided filename';

  async handler(args: ArgumentsCamelCase): Promise<void> {
    // Special considerations for the root command
    // If we have more than one params, then we're not this handler
    if (args?._?.length > 1) {
      return;
    }

    // If we have piped input, then we need to handle it
    if (process.stdin.isTTY === false) {
      console.log('TODO: PIPED INPUT');
    } else if (
      args.filename &&
      args.filename.toString().toLowerCase().endsWith('.csv')
    ) {
      console.log(`TODO: Filename provided: ${args.filename}`);
    } else {
      console.log('No valid input provided. Use --help for usage.');
    }
  }
}

export default RootCommand;
