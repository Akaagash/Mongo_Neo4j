const { spawn } = require('child_process');
const path = require('path');

// Configuration for the 4 systems to run
const processes = [
  { 
    name: 'Mongo-Backend', 
    command: 'npm', 
    args: ['run', 'dev'], 
    cwd: path.join(__dirname, 'mongodb-system', 'backend'), 
    color: '\x1b[32m' // Green
  },
  { 
    name: 'Mongo-Frontend', 
    command: 'npm', 
    args: ['run', 'dev'], 
    cwd: path.join(__dirname, 'mongodb-system', 'frontend'), 
    color: '\x1b[36m' // Cyan
  },
  { 
    name: 'Neo4j-Backend', 
    command: 'npm', 
    args: ['run', 'dev'], 
    cwd: path.join(__dirname, 'neo4j-system', 'backend'), 
    color: '\x1b[34m' // Blue
  },
  { 
    name: 'Neo4j-Frontend', 
    command: 'npm', 
    args: ['run', 'dev'], 
    cwd: path.join(__dirname, 'neo4j-system', 'frontend'), 
    color: '\x1b[35m' // Magenta
  }
];

console.log('==================================================');
console.log('🚀 Starting IPL Cricket Project - All Systems');
console.log('==================================================\n');

processes.forEach(proc => {
  console.log(`Starting ${proc.name} in ${proc.cwd}...`);
  
  // shell: true is required on Windows for npm to resolve properly
  const child = spawn(proc.command, proc.args, { cwd: proc.cwd, shell: true });

  child.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      // Print line by line with the colored prefix
      output.split('\n').forEach(line => {
        console.log(`${proc.color}[${proc.name}]\x1b[0m ${line}`);
      });
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      output.split('\n').forEach(line => {
        console.error(`${proc.color}[${proc.name} ERROR]\x1b[0m ${line}`);
      });
    }
  });

  child.on('close', (code) => {
    console.log(`${proc.color}[${proc.name}]\x1b[0m Exited with code ${code}`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down all systems...');
  process.exit();
});
