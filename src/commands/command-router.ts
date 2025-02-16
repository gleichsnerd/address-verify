import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import RootCommand from './root-command.js';
import BaseCommand from './base-command.js';

/**
 * CommandRouter: Handles registration, parsing, and routing of all commands via Yargs
 *
 * This class abstracts our Yargs implementation to allow for easy addition of commands
 * as well as a separate interface for triggering commands in case we want to switch the
 * primary CLI engine.
 *
 * *Developer's Note:*
 * This class is designed to be the primary entry point for triggering execution based on
 * command input. It also allows us to easily test both our default command triggers as
 * well as the edge cases that we try to not hit in our default handlers.
 *
 * @class CommandRouter
 * @param {BaseCommand[]} [commands=[new RootCommand()]] - An array of commands to override default commands
 */
class CommandRouter {
  private commands: BaseCommand[] = [];
  constructor(commands: BaseCommand[] = [new RootCommand()]) {
    // Register commands upfront
    this.commands = commands;
  }

  async handle(processArgs: string[] = process.argv): Promise<number> {
    const cli = yargs(hideBin(processArgs));
    this.commands.forEach((command) => command.register(cli));

    try {
      await cli
        .demandCommand(
          1,
          'You must specify a command or pipe in a compliant csv file to begin',
        )
        .strictCommands()
        .help()
        .fail((_msg, error) => {
          console.error(_msg);
          if (error) {
            throw error;
          }
        })
        .parse();
    } catch (error) {
      console.error('Error occurred while handling commands:', error);
      return 1;
    }
    return 0;
  }
}

export default CommandRouter;
