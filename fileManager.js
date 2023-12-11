//renderer.js
const { ipcRenderer } = require("electron");

const fsSpan = document.getElementById('fs');
const chDir = document.createElement('button');
chDir.textContent = 'Open Folder'; 
chDir.style.backgroundColor = '#0078d4';
chDir.style.borderColor = '#0078d4';

chDir.style.display = 'block';
chDir.style.marginLeft = 'auto';
chDir.style.marginRight = 'auto';
chDir.style.color = 'white'
chDir.addEventListener('click', () => {
  ipcRenderer.send('open-folder-dialog');
});

fsSpan.appendChild(chDir);

//Send file name clicked from fileManager.js
ipcRenderer.on('files-in-directory', (event, files) => {
  fsSpan.innerHTML = ''; // Clear previous content

  files.forEach(fileName => {
    const fileButton = document.createElement('button');
    fileButton.textContent = fileName;
    fileButton.style.display = 'block'; // Set the display to block
    fileButton.addEventListener('click', () => {
      // Send the filename to the main process
      ipcRenderer.send('file-button-clicked', fileName);
    });
    fsSpan.appendChild(fileButton);
  });

  // After receiving files, ensure the button is still visible at the top
  fsSpan.insertBefore(chDir, fsSpan.firstChild);
});





let filePath
// Listen for the file-path event from the main process
ipcRenderer.on('file-path', (event, filepath) => {
  filePath = filepath;
  console.log('Received filePath in renderer:', filepath);
  // You can perform actions with filePath variable in your renderer process
  // For instance, update the UI or perform any necessary tasks
});




// Handle file button click and request content from main process
ipcRenderer.on('file-content', (event, content) => {
  document.getElementById('textArea').value = content; // Set textarea value with file content
});


const fileContentTextArea = document.getElementById('textArea');

function saveChanges() {
  const updatedContent = fileContentTextArea.value;

  ipcRenderer.send('save-file', { filePath, content: updatedContent });
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
