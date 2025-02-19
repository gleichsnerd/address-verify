import '../utilities/tests/mocks/smartystreets-javascript-sdk.js';
import { describe, it, expect } from 'vitest';
import RootCommand from './root-command.js';
import captureOutput from '../utilities/tests/capture-output.js';
import { ArgumentsCamelCase } from 'yargs';
import mockStdin from '../utilities/tests/mock-stdin.js';
import path from 'path';
import fs from 'fs';

describe('RootCommand', () => {
  beforeEach(() => {
    process.stdin.isTTY = true;
    process.env.SMARTY_AUTH_ID = 'test-id';
    process.env.SMARTY_AUTH_TOKEN = 'test-token';
  });

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

  it('rejects zero arguments if no pipe data', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({ _: [] } as unknown as ArgumentsCamelCase),
    );
    // Should not output anything as it early returns to allow other commands to run
    expect(output).toBe('No valid input provided. Use --help for usage.');
  });

  it('skips when more than one argument', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({ _: ['arg1', 'arg2'] } as ArgumentsCamelCase),
    );
    // Should not output anything as it early returns to allow other commands to run
    expect(output).toBe('');
  });

  it('fails early if missing environment variables', async () => {
    delete process.env.SMARTY_AUTH_ID;
    delete process.env.SMARTY_AUTH_TOKEN;
    const command = new RootCommand();
    const { error } = await captureOutput(() =>
      command.handler({
        filename: 'data/test-mixed.csv',
      } as unknown as ArgumentsCamelCase),
    );
    // Should not output anything as it early returns to allow other commands to run
    expect(error).toBe(
      'Missing required environment variables SMARTY_AUTH_ID and SMARTY_AUTH_TOKEN',
    );
  });

  it('handles piped input', async () => {
    process.stdin.isTTY = false;

    const command = new RootCommand();
    const testFile = path.join(
      __dirname,
      '../utilities/tests/fixtures/csv/valid.csv',
    );
    const fileContents = fs.readFileSync(testFile, 'utf8');
    mockStdin(fileContents);
    const { output } = await captureOutput(() =>
      command.handler({ _: [] } as unknown as ArgumentsCamelCase),
    );

    expect(output).toContain('Reading piped input');
    expect(output).toContain('2 addresses to validate');

    process.stdin.isTTY = true;
  });

  it('handles `filename` parameter', async () => {
    const command = new RootCommand();
    const { output } = await captureOutput(() =>
      command.handler({
        filename: 'data/test-mixed.csv',
      } as unknown as ArgumentsCamelCase),
    );

    expect(output).toContain('Reading provided file: data/test-mixed.csv');
    expect(output).toContain('2 addresses to validate');
    expect(output).toContain(
      '143 e Maine Street, Columbus, 43215 -> 143 e Maine Street, Columbus, 43215',
    );
    expect(output).toContain('1 Empora St, Invalid, 11111 -> Invalid Address');
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
