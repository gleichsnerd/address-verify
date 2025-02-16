import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommandRouter from './command-router.js';
import RootCommand from './root-command.js';
import BaseCommand from './base-command.js';
import captureOutput from '../utilities/capture-output.js';

class FakeCommandSuccess extends BaseCommand {
  command = 'fake-success';
  handler(): void {
    console.log('Fake success');
    return;
  }
}

class FakeCommandFailure extends BaseCommand {
  command = 'fake-failure';
  handler(): void {
    throw new Error('Test failure');
  }
}

vi.mock('yargs/helpers', () => ({
  hideBin: vi.fn((args) => args),
}));

describe('CommandRouter', () => {
  let router: CommandRouter | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    router = null;
  });

  it('should initialize with default commands', () => {
    router = new CommandRouter();
    expect(router['commands']).toHaveLength(1);
    expect(router['commands'][0]).toBeInstanceOf(RootCommand);
  });

  it('should initialize with passed in commands', () => {
    router = new CommandRouter([
      new FakeCommandSuccess(),
      new FakeCommandFailure(),
    ]);
    expect(router['commands']).toHaveLength(2);
    expect(router['commands'][0]).toBeInstanceOf(FakeCommandSuccess);
    expect(router['commands'][1]).toBeInstanceOf(FakeCommandFailure);
  });

  it('should handle working commands', async () => {
    router = new CommandRouter([
      new FakeCommandSuccess(),
      new FakeCommandFailure(),
    ]);
    const { output, error } = await captureOutput(async () => {
      const result = await router?.handle(['fake-success']);
      expect(result).toBe(0);
      return result;
    });
    expect(output).toBe('Fake success');
    expect(error).toBe('');
  });

  it('should catch failing commands and log', async () => {
    router = new CommandRouter([
      new FakeCommandSuccess(),
      new FakeCommandFailure(),
    ]);
    const { output, error } = await captureOutput(async () => {
      const result = await router?.handle(['fake-failure']);
      expect(result).toBe(1);
    });
    expect(output).toBe('');
    expect(error).toContain('Error occurred while handling command');
  });
});
