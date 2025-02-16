import { describe, it, expect } from 'vitest';
import BaseCommand from './base-command.js';
import { Argv } from 'yargs';

describe('BaseCommand', () => {
  it('throws if no command string', async () => {
    class NoCommand extends BaseCommand {
      handler() {
        return;
      }
    }

    const command = new NoCommand();

    try {
      command.handler();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe('Command string is required');
    }
  });

  it('succeeds with a command string', async () => {
    class WithCommand extends BaseCommand {
      command = 'test';
      handler() {
        return;
      }
    }

    const command = new WithCommand();

    command.handler();
    expect(command.command).toBe('test');
  });

  it('allows for a description', async () => {
    class WithDescription extends BaseCommand {
      command = 'test';
      description = 'This is a test command';
      handler() {
        return;
      }
    }

    const command = new WithDescription();
    expect(command.description).toBe('This is a test command');
  });

  it('registers with a CommandModule object', async () => {
    const mockYargs = {
      command: vi.fn().mockReturnThis(),
    };
    class WithCommand extends BaseCommand {
      command = 'test';
      handler() {
        return;
      }
    }

    const command = new WithCommand();
    command.register(mockYargs as unknown as Argv);

    expect(mockYargs.command).toHaveBeenCalledTimes(1);
    const actualCall = mockYargs.command.mock.calls[0][0];
    expect(actualCall.command).toBe('test');
    expect(actualCall.describe).toBeUndefined();
    expect(typeof actualCall.handler).toBe('function');
  });
});
