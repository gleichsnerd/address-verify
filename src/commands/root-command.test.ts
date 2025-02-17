import { describe, it, expect } from 'vitest';
import RootCommand from './root-command.js';
import captureOutput from '../utilities/tests/capture-output.js';
import { ArgumentsCamelCase } from 'yargs';

describe('RootCommand', () => {
  it('has correct command', async () => {
    const command = new RootCommand();
    expect(command.command).toBe('$0 [filename]');
  });

  it('has correct description', async () => {
    const command = new RootCommand();
    expect(command.describe).toBe(
      'Validates addresses for piped-in CSV files or provided CSV filename',
    );
  });

  it('allows zero arguments than one argument', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({ _: ['arg1', 'arg2'] } as ArgumentsCamelCase),
    );
    // Should not output anything as it early returns to allow other commands to run
    expect(output).toBe('');
  });

  it('rejects more than one argument', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({ _: ['arg1', 'arg2'] } as ArgumentsCamelCase),
    );
    // Should not output anything as it early returns to allow other commands to run
    expect(output).toBe('');
  });

  it('handles piped input', async () => {
    const originalIsTTY = process.stdin.isTTY;
    process.stdin.isTTY = false;

    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({ _: [] } as unknown as ArgumentsCamelCase),
    );

    expect(output).toBe('TODO: PIPED INPUT');

    // Restore original isTTY value
    process.stdin.isTTY = originalIsTTY;
  });

  it('handles `filename` parameter', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({
        filename: 'data/test-example.csv',
      } as unknown as ArgumentsCamelCase),
    );

    expect(output).toContain(
      'Reading provided file: data/test-example.csv\n2 addresses to validate',
    );
  });

  it('rejects non-csv files', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({
        filename: 'testfile.txt',
      } as unknown as ArgumentsCamelCase),
    );

    expect(output).toBe(
      'Invalid filename `testfile.txt`. Use --help for usage.',
    );
  });
});
