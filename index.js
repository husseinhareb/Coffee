//index.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const pty = require("node-pty");
const path = require('path');
const fs = require('fs');
const os = require("os");
const { connected } = require('process');

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
  let currentDirectory;
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
            currentDirectory = selectedDirectory;
            console.log(files);
            console.log("Current Directory",currentDirectory);
            chTerminalPath(currentDirectory);
          }
        });
      }
    }).catch(err => {
      console.error(err);
    });


  });
  
  ipcMain.on('file-button-clicked', (event, fileName) => {
    const clickedPath = path.join(currentDirectory, fileName);
  
    // Check if the clicked item is a file or directory
    fs.stat(clickedPath, (err, stats) => {
      if (err) {
        console.error(err);
        event.sender.send('file-system-error', err.message);
        return;
      }
  
      if (stats.isFile()) {
        // It's a file
        console.log("It's a file:", fileName);
  
        // Send the file path to the renderer process
        event.sender.send('file-path', clickedPath);
  
        // Read file content and send it to the renderer process
        fs.readFile(clickedPath, 'utf-8', (readErr, data) => {
          if (readErr) {
            console.error(readErr);
            event.sender.send('file-content', ''); // Sending empty content in case of error
          } else {
            console.log('File content:', data);
            event.sender.send('file-content', data); // Sending file content to renderer process
            currentDirectory = path.dirname(clickedPath); // Update the current directory to the file's directory
          }
        });
      } else if (stats.isDirectory()) {
        // It's a directory
        console.log("It's a directory:", fileName);
  
        // Read the contents of the clicked directory
        fs.readdir(clickedPath, (readDirErr, files) => {
          if (readDirErr) {
            console.error(readDirErr);
            event.sender.send('files-in-directory', []); // Sending empty array in case of error
          } else {
            event.sender.send('files-in-directory', files); // Sending directory contents to renderer process
            console.log('Files in directory:', files);
            currentDirectory = clickedPath; // Update the current directory
            chTerminalPath(currentDirectory);
          }
        });
      } else {
        // It's neither a file nor a directory
        console.log("It's neither a file nor a directory:", fileName);
        event.sender.send('file-unknown', fileName);
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
  const fileContent = ''; 
  const filePath = path.join(currentDirectory, fileName); 
  console.log('from file creation print' + filePath);
  // Handle the file creation here and send back the result to the renderer
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error('Error creating file:', err);
      event.sender.send('file-creation-error', err.message);
      return;
    }
    console.log(`File "${fileName}" created successfully at ${currentDirectory}`);
    event.sender.send('file-creation-success', fileName);
  });
});


ipcMain.on('folder-creation-request', (event, folderName) => {
  
  // Sanitize folder name if necessary (for example, replacing invalid characters)
  const sanitizedFolderName = folderName.replace(/[^\w\s]/gi, ''); // Replace non-word characters

  const folderPath = path.join(currentDirectory, sanitizedFolderName);

  // Create the folder
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      event.sender.send('folder-creation-error', err.message);
    } else {
      console.log(`Folder "${folderPath}" created successfully`);
      event.sender.send('folder-creation-success', folderPath);
    }
  });
});


ipcMain.on('return-to-parent-directory', (event) => {
  if (!currentDirectory) {
    // If the current directory is not set, do nothing or handle accordingly
    return;
  }
  const parentDirectory = path.dirname(currentDirectory);

  fs.readdir(parentDirectory, (err, files) => {
    if (err) {
      console.error(err);
      event.sender.send('files-in-directory', []);
    } else {
      event.sender.send('files-in-directory', files);
      console.log(files);
      currentDirectory = parentDirectory; 
      chTerminalPath(currentDirectory);

    }
  });
});


function chTerminalPath(termPath)
{
ptyProcess.kill(); 
ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: termPath,
  env: process.env,
});
ptyProcess.on('data', function(data) {
  mainWindow.webContents.send("terminal.incomingData", data);
  console.log("Data sent");
});

ipcMain.on("terminal.keystroke", (event, key) => {
  ptyProcess.write(key);
});
}


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

