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
