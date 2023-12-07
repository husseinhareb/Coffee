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
  addFileBtn.addEventListener('click', addFile);
  fss.appendChild(addFileBtn);

  // Sort the file paths alphabetically
  fileArray.sort();

  fileArray.forEach(filePath => {
    const button = document.createElement('button');
    button.textContent = filePath;
    button.addEventListener('click', () => openFile(filePath));

    const buttonWrapper = document.createElement('div');
    buttonWrapper.appendChild(button);
    fss.appendChild(buttonWrapper);
  });
});



function addFile() {
  const fss = document.getElementById('fs');
  const newButton = document.createElement('button');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.style.width = "80px"; 
  textArea.style.height = "20px"
  textArea.placeholder = "Enter button name";
  textArea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && textArea.value.trim() !== '') {
      newButton.textContent = textArea.value;
      newButton.addEventListener('click', () => openFile(textArea.value));
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newButton);
      fss.appendChild(buttonWrapper);
      textArea.remove();

      ipcRenderer.send('file-creation-request', textArea.value);
    }
  });
  fss.appendChild(textArea);
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

