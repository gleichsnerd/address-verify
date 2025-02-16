import { ArgumentsCamelCase, Argv as Yargs, CommandModule } from 'yargs';

/**
 * Base class for adding commands to the CLI via Yargs
 *
 * Integrates with CommandRouter to abstract command registration and execution
 *
 * *Developer's Note:*
 * Although we only have one command in this submission, this class is designed
 * for easy addition of more commands by extending and setting the relevant
 * properties. It also allows us for easy testing of handlers and prevents
 * massive Yarg configurations in a single file.
 * Future work would include adding support for argument flags.
 *
 * @class BaseCommand
 * @abstract
 */
abstract class BaseCommand {
  protected command?: string;
  protected describe?: string;

  protected getCommandModule(): CommandModule {
    if (!this.command) {
      throw new Error('`command` is required');
    }
    return {
      command: this.command,
      describe: this.describe,
      handler: this.handler.bind(this),
    };
  }

  public register(cli: Yargs): void {
    cli.command(this.getCommandModule());
  }

  abstract handler(args: ArgumentsCamelCase): Promise<void> | void;
}

export default BaseCommand;
