// Cross-platform script to start Next.js on any available port
import { exec } from 'child_process';
import net from 'net';
import path from 'path';
import fs from 'fs';

const PORT = 3000;
const NEXT_DIR = '.next';

/**
 * Force close any process on the specified port
 * @param {number} port - The port to close
 * @returns {Promise<void>}
 */
async function forceClosePort(port) {
  return new Promise((resolve) => {
    // Plattformspezifische Befehle
    const commands = process.platform === 'win32' 
      ? [
          `netstat -ano | findstr :${port} | findstr LISTENING && taskkill /F /PID`,
          `taskkill /F /IM node.exe`,
          `taskkill /F /IM "Microsoft Edge"`,
          `taskkill /F /IM chrome.exe`
        ]
      : [
          `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`,
          `pkill -f node`
        ];

    const executeCommands = async () => {
      for (const command of commands) {
        try {
          await new Promise((resolve) => exec(command, (error) => {
            if (error) {
              console.log(`\x1b[33mNo process found on port ${port}\x1b[0m`);
            } else {
              console.log(`\x1b[33mSuccessfully closed any existing process on port ${port}\x1b[0m`);
            }
            resolve();
          }));
        } catch (error) {
          console.log(`\x1b[33mError executing command: ${error.message}\x1b[0m`);
        }
      }
      resolve();
    };

    executeCommands();
  });
}

/**
 * Clean up .next directory
 * @returns {Promise<void>}
 */
async function cleanupNextDir() {
  try {
    const nextPath = path.join(process.cwd(), NEXT_DIR);
    if (fs.existsSync(nextPath)) {
      // Plattformunabhängiger Befehl zum Löschen des Verzeichnisses
      const command = process.platform === 'win32' 
        ? `rmdir /s /q "${nextPath}"`
        : `rm -rf "${nextPath}"`;
        
      exec(command, (error) => {
        if (error) {
          console.log(`\x1b[33mError cleaning .next directory: ${error.message}\x1b[0m`);
        } else {
          console.log(`\x1b[33mCleaned up .next directory\x1b[0m`);
        }
      });
    }
  } catch (error) {
    console.log(`\x1b[33mError cleaning .next directory: ${error.message}\x1b[0m`);
  }
}

/**
 * Check if a port is available
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

/**
 * Always use port 3000
 * @returns {Promise<number>} - Always returns 3000
 */
async function getPort() {
  const available = await isPortAvailable(PORT);
  if (!available) {
    await forceClosePort(PORT);
  }
  await cleanupNextDir();
  return PORT;
}

/**
 * Start Next.js with the specified port
 * @param {number} port - Port number to use
 */
function startNextJs(port) {
  console.log(`\x1b[32mStarting Next.js on port ${port}...\x1b[0m`);
  
  const command = `npx next dev --port ${port} --hostname 0.0.0.0`;
  
  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`\x1b[31mError starting Next.js: ${error.message}\x1b[0m`);
      return;
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    if (stdout) {
      console.log(stdout);
    }
  });
  
  // Pipe output to console in real-time
  if (childProcess.stdout) {
    childProcess.stdout.pipe(process.stdout);
  }
  
  if (childProcess.stderr) {
    childProcess.stderr.pipe(process.stderr);
  }
  
  // Handle process termination
  process.on('SIGINT', () => {
    childProcess.kill();
    process.exit(0);
  });
}

// Main function
async function main() {
  try {
    // Always use port 3000
    const port = await getPort();
    
    // Save the port to an environment variable for other parts of the application
    process.env.NEXT_PUBLIC_PORT = port.toString();
    
    // Start Next.js
    startNextJs(port);
  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

// Run the main function
main();