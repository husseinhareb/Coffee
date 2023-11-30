const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

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
}

app.whenReady().then(createWindow);
