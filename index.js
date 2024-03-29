//index.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const pty = require("node-pty");
const path = require('path');
const fs = require('fs');
const os = require("os");
const electronReload = require('electron-reload');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true
electronReload(__dirname);
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    //resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');


  let ptyProcess; // Define this variable outside the function to keep track of the current terminal instance

  // Define the terminal creation function
  function chTerminalPath(termPath) {
    // Kill the existing terminal process if it exists
    if (ptyProcess) {
      ptyProcess.kill();
    }

    //terminal
    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: termPath,
      env: process.env,
    });

    ptyProcess.on('data', function (data) {
      mainWindow.webContents.send("terminal.incomingData", data);
      console.log("Data sent");
    });
  }
  // Function to get the list of folders in a directory




  // Attach the terminal keystroke listener outside the function
  ipcMain.on("terminal.keystroke", (event, key) => {
    if (ptyProcess) {
      ptyProcess.write(key);
    }
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
            console.log("Current Directory", currentDirectory);
            chTerminalPath(currentDirectory);

            // Retrieve and send the list of folders
            const folderList = getFoldersInDirectory(currentDirectory);
            event.sender.send('folders-in-directory-result', folderList);
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

        fs.readFile(clickedPath, 'utf-8', (readErr, data) => {
          if (readErr) {
            console.error(readErr);
            event.sender.send('file-content', { fileName, content: '' }); // Sending empty content in case of error along with the file name
          } else {
            //console.log('File content:', data);
            event.sender.send('file-content', { fileName, content: data }); // Sending file name and content to renderer process
            currentDirectory = path.dirname(clickedPath); // Update the current directory to the file's directory
          }
        });

      } else if (stats.isDirectory()) {
        // It's a directory
        const folderPath = path.join(currentDirectory, fileName);
        console.log("It's a folder:", folderPath);
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            console.error(err);
            event.sender.send('files-in-directory', []); // Sending empty array in case of error
          } else {
            event.sender.send('files-in-directory', files); // Sending directory contents to renderer process
            console.log('Files in directory:', files);
            currentDirectory = folderPath; // Update the current directory
            ptyProcess.kill();
            chTerminalPath(currentDirectory);

            const folderList = [];

            files.forEach(fileName => {
              try {
                const stats = fs.statSync(path.join(folderPath, fileName));
                if (stats.isDirectory()) {
                  folderList.push(fileName);
                }
              } catch (statErr) {
                console.error(`Error getting stats for ${fileName}:`, statErr);
              }
            });
            event.sender.send('folders-in-directory-result', folderList);
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

    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
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



  function getFoldersInDirectory(directory) {
    const folderList = [];
    try {
      const files = fs.readdirSync(directory);
      files.forEach(fileName => {
        const filePath = path.join(directory, fileName);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            folderList.push(fileName);
          }
        } catch (statErr) {
          // Handle stat error, log or ignore as needed
          console.error(`Error getting stats for ${filePath}:`, statErr);
        }
      });
    } catch (err) {
      // Handle readdirSync error, log or rethrow as needed
      console.error(`Error reading directory ${directory}:`, err);
    }
    return folderList;
  }


  ipcMain.on('return-to-parent-directory', (event) => {
    if (!currentDirectory) {
      console.error('Current directory not set.');
      return;
    }
    const parentDirectory = path.dirname(currentDirectory);

    console.log('Returning to parent directory:', parentDirectory);

    fs.readdir(parentDirectory, (err, files) => {
      if (err) {
        console.error(err);
        event.sender.send('files-in-directory', []);
      } else {
        event.sender.send('files-in-directory', files);

        const folderList = getFoldersInDirectory(parentDirectory);
        console.log('Folders in parent directory:', folderList);

        event.sender.send('folders-in-directory-result', folderList);

        console.log('Files in parent directory:', files);

        currentDirectory = parentDirectory;
        ptyProcess.kill();

        chTerminalPath(currentDirectory);
      }
    });
  });




  ipcMain.on('reload-folder', (event) => {
    if (!currentDirectory) {
      // Handle if the current directory is not set
      return;
    }

    fs.readdir(currentDirectory, (err, files) => {
      if (err) {
        console.error(err);
        event.sender.send('files-in-directory', []);
      } else {
        event.sender.send('files-in-directory', files);
        console.log(files);
        ptyProcess.kill(); // Kill the existing terminal process if needed

        chTerminalPath(currentDirectory); // Reinitialize terminal with current directory
      }
    });
  });

  ipcMain.on('delete-file', (event, fileName) => {
    const filePath = path.join(currentDirectory, fileName);

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        event.sender.send('file-deletion-error', err.message);
        return;
      }

      console.log(`File "${fileName}" deleted successfully`);
      event.sender.send('file-deletion-success', fileName);
    });
  });




  ipcMain.on('rename-file', (event, { oldFileName, newFileName }) => {
    // Construct the file paths for the old and new filenames
    const oldFilePath = path.join(currentDirectory, oldFileName);
    const newFilePath = path.join(currentDirectory, newFileName);

    // Rename the file
    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) {
        console.error(`Error renaming file ${oldFileName} to ${newFileName}:`, err);
        event.reply('rename-file-error', err.message);
      } else {
        console.log(`File ${oldFileName} renamed to ${newFileName} successfully`);
        event.reply('rename-file-success', { oldFileName, newFileName });
      }
    });
  });

  ipcMain.on('theme-changer', (event, value) => {
    console.log("changing theme with value:", value);
  })

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
