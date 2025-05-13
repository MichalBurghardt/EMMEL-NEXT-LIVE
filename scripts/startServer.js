import { exec } from 'child_process';
import { createServer } from 'net';

// Define the ports to try
const DEFAULT_PORT = 3000;
const ALTERNATIVE_PORTS = [3001, 3002, 3003, 3004, 3005];
const ALL_PORTS = [DEFAULT_PORT, ...ALTERNATIVE_PORTS];

// Function to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.once('error', (err) => {
      // If the error code is EADDRINUSE, the port is in use
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Port is free, close the server
      server.close();
      resolve(false);
    });
    
    // Try to listen on the port
    server.listen(port, '0.0.0.0');
  });
}

// Find the first available port
async function findAvailablePort() {
  for (const port of ALL_PORTS) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is already in use, trying next port...`);
  }
  
  console.error('All specified ports are in use. Please free up one of the ports or add more alternatives.');
  process.exit(1);
}

// Main function to start the server
async function startServer() {
  try {
    // Find available port
    const port = await findAvailablePort();
    
    // Set the port as an environment variable
    process.env.PORT = port;
    console.log(`Starting Next.js server on port ${port}`);
    
    // Start the Next.js development server
    // Using exec instead of execSync to allow for async operation
    const cmd = `cross-env PORT=${port} next dev -p ${port}`;
    console.log(`Running command: ${cmd}`);
    
    const nextProcess = exec(cmd);

    // Pipe the output to the console
    if (nextProcess.stdout) {
      nextProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
    }
    
    if (nextProcess.stderr) {
      nextProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    }

    // Handle process exit
    nextProcess.on('close', (code) => {
      console.log(`Next.js process exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

// Run the server
startServer();