//index.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const pty = require("node-pty");
const path = require('path');
const fs = require('fs');
const os = require("os");

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true

let mainWindow;

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
  let selectedDirectory;
  //Open Folder Button + Listing Files inside the folder.
  ipcMain.on('open-folder-dialog', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        selectedDirectory = result.filePaths[0];
        console.log(selectedDirectory);
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
  
//Sending File Data into the renderer
ipcMain.on('file-button-clicked', (event, fileName) => {
  const filePath = path.join(selectedDirectory, fileName); // Assuming selectedDirectory holds the selected folder path
  //Sending file path to the renderer
  event.sender.send('file-path', filePath); 
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      event.sender.send('file-content', ''); // Sending empty content in case of error
    } else {
      console.log(data);
      event.sender.send('file-content', data); // Sending file content to renderer process
    }
  });
});


ipcMain.on('save-file', (event, { filePath, content }) => {
  // Check if 'content' is a string
  if (typeof content !== 'string') {
    // Handle the case where content is not a string
    console.error('Invalid content type. Expected string.');
    event.reply('file-save-error', 'Invalid content type. Expected string.');
    return;
  }

  // Continue with the file writing process
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      // Handle errors when saving the file
      console.error(err);
      event.reply('file-save-error', err.message);
      return;
    }
    // Send a confirmation message back to the renderer process
    event.reply('file-saved', 'File saved successfully!');
  });
});
  
ipcMain.on('file-creation-request', (event, fileName) => {
  const currentDir = app.getAppPath(); // Get the app directory
  const fileContent = ''; // Specify the content you want in the new file
  const filePath = path.join(selectedDirectory, fileName); // Assuming selectedDirectory holds the selected folder path
  console.log('from file creation print' + filePath);
  // Handle the file creation here and send back the result to the renderer
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error('Error creating file:', err);
      // Sending an error back to the renderer if file creation fails
      event.sender.send('file-creation-error', err.message);
      return;
    }
    console.log(`File "${fileName}" created successfully at ${currentDir}`);
    // Sending a success message back to the renderer
    event.sender.send('file-creation-success', fileName);
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