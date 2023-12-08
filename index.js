//index.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path')

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
      event.reply('file-content', ''); 
      return;
    }
    event.reply('file-content', data);
  });
});


ipcMain.on('file-creation-request', (event, fileName) => {
  const currentDir = app.getAppPath(); // Get the app directory
  const fileContent = ''; // Specify the content you want in the new file
  const filePath = path.join(currentDir, fileName); // Create the full path to the new file

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

ipcMain.on('get-file-content', (event, filePath) => {
  // Here you can use the 'filePath' received from the renderer process
  // For instance, you can read the content of the file using 'fs' module
  fs.readFile(filePath, 'utf8', (err, fileContent) => {
    if (err) {
      // Handle errors when reading the file
      console.error(err);
      // Send an error message back to the renderer process if needed
      event.reply('file-content-error', err.message);
      return;
    }
    // Send the file content back to the renderer process
    event.reply('file-content', fileContent);
  });
});

// Handle saving file content from the renderer process
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



ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {
      const selectedDirectory = result.filePaths[0];

      exec(`ls ${selectedDirectory}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Command stderr: ${stderr}`);
          return;
        }

        const files = stdout.trim().split('\n');
        event.sender.send('files', files);
      });
    }
  }).catch(err => {
    console.log(err);
  });
});



}
app.whenReady().then(createWindow);

