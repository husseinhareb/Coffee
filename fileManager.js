// filesystem.js

ipcRenderer.on('files', (event, fileArray) => {
  const fss = document.getElementById('fs');

  fileArray.forEach(fileName => {
    const button = document.createElement('button');
    button.textContent = fileName;
    button.addEventListener('click', () => getFileContent(fileName));

    const buttonWrapper = document.createElement('div');
    buttonWrapper.appendChild(button);
    fss.appendChild(buttonWrapper);
  });
});

function getFileContent(fileName) {
  ipcRenderer.send('get-file-content', fileName);
}

ipcRenderer.on('file-content', (event, fileContent) => {
  const textArea = document.getElementById('textArea');
  textArea.value = fileContent;
});

// filesystem.js

let currentFilePath = ''; // Variable to store the path of the currently opened file

ipcRenderer.on('files', (event, fileArray) => {
  const fss = document.getElementById('fs');
  fss.innerHTML = ''; // Clear the content to avoid duplication

  fileArray.forEach(filePath => {
    const button = document.createElement('button');
    button.textContent = filePath;
    button.addEventListener('click', () => openFile(filePath));

    const buttonWrapper = document.createElement('div');
    buttonWrapper.appendChild(button);
    fss.appendChild(buttonWrapper);
  });
});

function openFile(filePath) {
  currentFilePath = filePath; // Update the current file path
  ipcRenderer.send('get-file-content', filePath);
}

function saveChangesToFile() {
  const textArea = document.getElementById('textArea');
  const fileContent = textArea.value; // Get the content from the textarea

  // Send an IPC message to the main process to save the content to the file associated with currentFilePath
  ipcRenderer.send('save-file', { filePath: currentFilePath, content: fileContent });
}

ipcRenderer.on('file-content', (event, fileContent) => {
  const textArea = document.getElementById('textArea');
  textArea.value = fileContent;
});
let path = ''; // Ensure that path is defined

ipcRenderer.on('path', (event, output) => {
  path = output;
  updateOutput();
});

// Function to check for file changes periodically
function checkForFileChanges() {
  if (!path) {
    console.error('Path is not defined.');
    return;
  }

  // Check the directory for changes
  fs.readdir(path, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    // Compare the files currently in the directory with the displayed buttons
    const buttons = document.querySelectorAll('#fs button');
    buttons.forEach(button => {
      if (!files.includes(button.textContent)) {
        // If the button's text (file name) is not found in the current files list, remove the button
        button.parentNode.remove();
      }
    });
  });
}

// Call the function periodically (e.g., every 5 seconds)
const fileCheckInterval = setInterval(checkForFileChanges, 5000); // Change the interval as needed

// Example: Clear the interval when closing the application
window.addEventListener('beforeunload', () => {
  clearInterval(fileCheckInterval);
});