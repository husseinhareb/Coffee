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
