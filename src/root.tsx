import { resolve } from 'node:path';

import { render } from 'ink';

import { StandaloneApp } from './app/StandaloneApp.tsx';

let restored = false;

function restoreTerminal() {
  if (restored) return;
  restored = true;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdout.write('\x1b[?1006l\x1b[?1000l\x1b[?25h\x1b[?1049l');
}

function resolveTargetDir(): string {
  const arg = process.argv[2];
  if (!arg) {
    return process.cwd();
  }

  return resolve(process.cwd(), arg);
}

process.on('SIGINT', () => {
  restoreTerminal();
  process.exit(0);
});
process.on('SIGTERM', () => {
  restoreTerminal();
  process.exit(0);
});
process.on('SIGHUP', () => {
  restoreTerminal();
  process.exit(0);
});
process.on('uncaughtException', (err) => {
  restoreTerminal();
  process.stderr.write(
    `Uncaught exception: ${err.message}\n${err.stack ?? ''}\n`,
  );
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  restoreTerminal();
  process.stderr.write(`Unhandled rejection: ${String(reason)}\n`);
  process.exit(1);
});

process.stdout.write('\x1b[?1049h\x1b[2J\x1b[H\x1b[?25l\x1b[?1000h\x1b[?1006h');

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

const { waitUntilExit } = render(<StandaloneApp dir={resolveTargetDir()} />);

await waitUntilExit();

restoreTerminal();
