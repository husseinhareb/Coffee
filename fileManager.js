// filesystem.js

const fss = document.getElementById('fs');

ipcRenderer.on('files', (event, fileArray) => {
  // Create buttons for each file
  fileArray.forEach(file => {
    const button = document.createElement('button');
    button.textContent = file;
    button.addEventListener('click', () => loadFileContent(file));

    // Append the button to the fs div
    fss.appendChild(button);
  });
});

function loadFileContent(fileName) {

  const textarea = document.getElementById('yourTextareaId');
  textarea.value = `Content of ${fileName} will be loaded here.`;
}

