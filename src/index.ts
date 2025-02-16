#!/usr/bin/env node

import CommandRouter from './commands/command-router.js';

async function main() {
  const router = new CommandRouter();
  const exitCode = await router.handle();
  return exitCode;
}

// Only call process.exit if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  main()
    .then((code) => {
      process.exit(code);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default main;
