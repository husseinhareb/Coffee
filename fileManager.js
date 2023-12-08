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


  const changeDir = document.createElement('button');
  changeDir.textContent = "change dir"
  changeDir.addEventListener('click', changeDirFn);
  fss.appendChild(changeDir);


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




function changeDirFn() {
  ipcRenderer.send('open-file-dialog');
}

// Listen for the selected directory from the main process
ipcRenderer.on('selected-directory', (event, path) => {
  console.log('Selected Directory:', path);
  // Use the selected path in your application
});


function addFile() {
  const fss = document.getElementById('fs');
  const newButton = document.createElement('button');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.style.width = "80px"; 
  textArea.style.height = "20px"
  textArea.placeholder = "fileName";
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
  const fileContent = textArea.value;

  ipcRenderer.send('save-file', { filePath: currentFilePath, content: fileContent });
}

ipcRenderer.on('file-content', (event, fileContent) => {
  const textArea = document.getElementById('textArea');
  textArea.value = fileContent;
});

const fileContentTextArea = document.getElementById('textArea');

function saveChanges() {
  const updatedContent = fileContentTextArea.value;

  ipcRenderer.send('save-file', { filePath: currentFilePath, content: updatedContent });
}


document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault(); 
    saveChanges(); 
  }
});

ipcRenderer.on('file-saved', (event, message) => {
  console.log(message);
});

function openFile(filePath) {
  currentFilePath = filePath; 
  console.log('File Path:', filePath); 
  ipcRenderer.send('get-file-content', filePath);
}


