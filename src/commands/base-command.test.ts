import { describe, it, expect } from 'vitest';
import BaseCommand from './base-command.js';

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
});
