import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const services = [
  { name: 'api-gateway', path: './api-gateway' },
  { name: 'auth-service', path: './services/auth' },
  { name: 'projects-service', path: './services/projects' },
  { name: 'bids-service', path: './services/bids' },
  { name: 'messages-service', path: './services/messages' },
  { name: 'notifications-service', path: './services/notifications' }
];

services.forEach(service => {
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve(__dirname, service.path),
    shell: true,
    stdio: 'inherit'
  });
  
  console.log(`Started ${service.name}`);
  
  proc.on('close', (code) => {
    console.log(`${service.name} exited with code ${code}`);
  });
});