const { spawn } = require('child_process');
const path = require('path');

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