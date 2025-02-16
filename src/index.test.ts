import { describe, it, expect, vi } from 'vitest';
import main from './index.js';
import CommandRouter from './commands/command-router.js';

vi.mock('./commands/command-router.js');

describe('Main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('should invoke CommandRouter handle successfully', async () => {
    const mockHandle = vi.fn().mockResolvedValue(0);
    vi.mocked(CommandRouter).mockImplementation(
      () =>
        ({
          handle: mockHandle,
        }) as unknown as CommandRouter,
    );

    const exitCode = await main();

    expect(exitCode).toBe(0);
    expect(CommandRouter).toHaveBeenCalledTimes(1);
    expect(mockHandle).toHaveBeenCalledTimes(1);
  });

  it('should bubble up CommandRouter errors for process.exit catch', async () => {
    const mockHandle = vi.fn().mockRejectedValue(new Error('Test Error'));
    vi.mocked(CommandRouter).mockImplementation(
      () =>
        ({
          handle: mockHandle,
        }) as unknown as CommandRouter,
    );

    try {
      await main();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }

    expect(CommandRouter).toHaveBeenCalledTimes(1);
    expect(mockHandle).toHaveBeenCalledTimes(1);
  });
});
