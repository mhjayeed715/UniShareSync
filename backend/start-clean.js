const { exec } = require('child_process');
const net = require('net');

function killPort5000() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :5000', (error, stdout) => {
      if (error || !stdout) {
        console.log('Port 5000 is free');
        resolve();
        return;
      }

      const lines = stdout.split('\n').filter(line => line.includes(':5000'));
      const pids = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(pid => pid && pid !== '0');

      if (pids.length === 0) {
        console.log('No processes found on port 5000');
        resolve();
        return;
      }

      console.log(`Killing ${pids.length} process(es) on port 5000...`);
      
      let killed = 0;
      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          killed++;
          if (!killError) {
            console.log(`Killed process ${pid}`);
          }
          if (killed === pids.length) {
            setTimeout(resolve, 1000); // Wait 1 second after killing
          }
        });
      });
    });
  });
}

function checkPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function startServer() {
  console.log('Checking port 5000...');
  
  const isFree = await checkPortFree(5000);
  if (!isFree) {
    await killPort5000();
    
    // Double check
    const stillBusy = !(await checkPortFree(5000));
    if (stillBusy) {
      console.log('Port still busy, waiting...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('Starting server...');
  require('./server.js');
}

startServer().catch(console.error);