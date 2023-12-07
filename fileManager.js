// filesystem.js

function getFileContent(fileName) {
  ipcRenderer.send('get-file-content', fileName);
}

ipcRenderer.on('file-content', (event, fileContent) => {
  const textArea = document.getElementById('textArea');
  textArea.value = fileContent;
});


let currentFilePath = ''; 

ipcRenderer.on('files', (event, fileArray) => {
  const fss = document.getElementById('fs');
  fss.innerHTML = ''; // Clear the content to avoid duplication

  const addFileBtn = document.createElement('button');
  addFileBtn.textContent = "+";
  addFileBtn.addEventListener('click',()=>addFile()); // Add the addFileBtn outside the forEach loop
  fss.appendChild(addFileBtn);

  fileArray.forEach(filePath => {
    const button = document.createElement('button');
    button.textContent = filePath;
    button.addEventListener('click', () => openFile(filePath));

    const buttonWrapper = document.createElement('div');
    buttonWrapper.appendChild(button);
    // Remove the addFileBtn from here
    fss.appendChild(buttonWrapper);
  });
});

function addFile()
{
  const newFile = document.getElementById('')
}

function openFile(filePath) {
  currentFilePath = filePath; 
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

