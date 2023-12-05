const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');

  exec('pwd', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
    win.webContents.send('path', stdout);
  });

  exec('whoami', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
    win.webContents.send('username', stdout);
  });

  exec('hostname', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
    win.webContents.send('hostname', stdout);
  });

  ipcMain.on('userInput', (event, userInput) => {
    exec(userInput, (error, stdout, stderr) => {
      if (error) {
        event.sender.send('executionResult', `Error: ${error.message}`);
        return;
      }
      if (stderr) {
        event.sender.send('executionResult', `stderr: ${stderr}`);
        return;
      }
      event.sender.send('executionResult', stdout);
    });
  });


// index.js
exec('ls', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
    return;
  }

  const files = stdout.trim().split('\n');
  win.webContents.send('files', files);
});


// index.js

fs.readFile('index.js', 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  win.webContents.send('more', data);
});


ipcMain.on('get-file-content', (event, fileName) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      event.reply('file-content', ''); // Sending empty content on error
      return;
    }
    event.reply('file-content', data);
  });
});
}

app.whenReady().then(createWindow);
