const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting Backend (port 5000) & Frontend (port 3000)...');

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  try { backend.kill(); } catch (_) {}
  try { frontend.kill(); } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
