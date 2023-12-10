//index.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const pty = require("node-pty");
const path = require('path');
const fs = require('fs');
const os = require("os");

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true

let mainWindow;
let selectedDirectory;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');



  //terminal
  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
  let ptyProcess;

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.on('data', function(data) {
    mainWindow.webContents.send("terminal.incomingData", data);
    console.log("Data sent");
  });

  ipcMain.on("terminal.keystroke", (event, key) => {
    ptyProcess.write(key);
  });


  //file manager
  
  //Open Folder Button + Listing Files inside the folder.
  ipcMain.on('open-folder-dialog', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        const selectedDirectory = result.filePaths[0];
        // Read files in the selected directory
        fs.readdir(selectedDirectory, (err, files) => {
          if (err) {
            console.error(err);
            event.sender.send('files-in-directory', []);
          } else {
            event.sender.send('files-in-directory', files);
            console.log(files);

          }
        });
      }
    }).catch(err => {
      console.error(err);
    });
  });
  
  


  




  
  
}












app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
