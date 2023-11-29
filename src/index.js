const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  ipcMain.on('getUsername', (event) => {
    exec('whoami', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      const username = stdout.trim();
      event.sender.send('username', username);
    });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('getUsername');
  });
});
