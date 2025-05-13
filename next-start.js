// Cross-platform script to start Next.js production server on any available port
import { exec } from 'child_process';
import net from 'net';

// Preferred ports in order of preference
const preferredPorts = [3000, 3001, 3002, 3003, 8080, 8081, 0]; // 0 means random port

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
 * Find the first available port from the list of preferred ports
 * @returns {Promise<number>} - Available port number
 */
async function findAvailablePort() {
  for (const port of preferredPorts) {
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`\x1b[33mPort ${port} is in use, trying next port...\x1b[0m`);
  }
  
  // If all preferred ports are busy, return 0 to let Next.js choose randomly
  return 0;
}

/**
 * Start Next.js production server with the specified port
 * @param {number} port - Port number to use
 */
function startNextJsProduction(port) {
  console.log(`\x1b[32mStarting Next.js production server on port ${port === 0 ? 'randomly selected' : port}...\x1b[0m`);
  
  const command = `npx next start --port ${port} --hostname 0.0.0.0`;
  
  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`\x1b[31mError starting Next.js production server: ${error.message}\x1b[0m`);
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
    // Use PORT from env if specified, otherwise find an available port
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : await findAvailablePort();
    
    // Save the port to an environment variable for other parts of the application
    process.env.NEXT_PUBLIC_PORT = port.toString();
    
    // Start Next.js production server
    startNextJsProduction(port);
  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

// Run the main function
main();