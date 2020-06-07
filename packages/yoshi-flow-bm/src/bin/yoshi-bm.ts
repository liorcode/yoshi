#!/usr/bin/env node

process.on('unhandledRejection', (error) => {
  throw error;
});

import arg from 'arg';
import loadConfig from 'yoshi-config/loadConfig';
import { Config } from 'yoshi-config/build/config';
import normalizeDebuggingArgs from 'yoshi-common/build/normalize-debugging-args';
import verifyDependencies from 'yoshi-common/build/verify-dependencies';
import verifyNodeVersion from 'yoshi-common/build/verify-node-version';
import { clearCache } from '../cache';

const defaultCommand = 'start';

export type CliCommand = (argv: Array<string>, config: Config) => Promise<void>;

const commands: {
  [command: string]: () => Promise<{ default: CliCommand }>;
} = {
  build: () => import('../scripts/build'),
  start: () => import('../scripts/start'),
  test: () => import('yoshi-flow-legacy/bin/yoshi-legacy'),
  lint: () => import('yoshi-flow-legacy/bin/yoshi-legacy'),
  info: () => import('yoshi-flow-legacy/bin/yoshi-legacy'),
  release: () => import('yoshi-flow-legacy/bin/yoshi-legacy'),
};

const args = arg(
  {
    // Types
    '--version': Boolean,
    '--help': Boolean,
    '--verbose': Boolean,
    '--clear-cache': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help',
  },
  {
    permissive: true,
  },
);

const { '--help': help, '--clear-cache': shouldClearCache } = args;

const foundCommand = Boolean(commands[args._[0]]);

if (!foundCommand && help) {
  console.log(`
    Usage
      $ yoshi-bm <command>

      Available commands
      ${Object.keys(commands).join(', ')}

      Options
      --version, -v   Version number
      --inspect       Enable the Node.js inspector
      --clear-cache   Clears the cache
      --help, -h      Displays this message

      For more information run a command with the --help flag
      $ yoshi-bm build --help
  `);

  process.exit(0);
}

if (shouldClearCache) {
  console.log('Clearing the cache...');
  clearCache();
  console.log('Cleared! ✔');
  process.exit(0);
}

const command = foundCommand ? args._[0] : defaultCommand;
const forwardedArgs = foundCommand ? args._.slice(1) : args._;

if (help) {
  forwardedArgs.push('--help');
}

Promise.resolve().then(async () => {
  verifyNodeVersion();
  await verifyDependencies();

  if (command === 'start') {
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    normalizeDebuggingArgs();
  }

  if (command === 'build') {
    process.env.NODE_ENV = 'production';
    process.env.BABEL_ENV = 'production';
  }

  const config = loadConfig();

  const runCommand = (await commands[command]()).default;

  // legacy flow commands doen't need to be run
  if (typeof runCommand === 'function') {
    await runCommand(forwardedArgs, config);
  }
});
