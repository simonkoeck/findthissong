import { spawn } from 'child_process';

export function spawnProcess(command, args) {
  return new Promise<{
    stdout: string;
    stderr: string;
  }>((resolve, reject) => {
    const child = spawn(command, args);

    if (!child) {
      return reject(new Error('Failed to spawn child process'));
    }

    let stdoutData = '';
    let stderrData = '';

    // Capture stdout data
    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Capture stderr data
    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // Handle process exit
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdoutData, stderr: stderrData });
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderrData}`));
      }
    });

    // Handle errors during the spawning of the process
    child.on('error', (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });
  });
}
