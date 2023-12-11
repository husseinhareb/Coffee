//renderer.js
const { ipcRenderer } = require("electron");

const fsSpan = document.getElementById('fs');
const chDir = document.createElement('button');

chDir.textContent = 'Open Folder'; 

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


ipcRenderer.on('files-in-directory', (event, files) => {
  files.forEach(fileName => {
    const fileButton = document.createElement('button');
    fileButton.textContent = fileName;
    fileButton.style.display = 'block';
    fileButton.addEventListener('click', () => {
      ipcRenderer.send('file-button-clicked', fileName); // Sending file name to main process
    });
    fsSpan.appendChild(fileButton);
  });

});

// Handle file button click and request content from main process
ipcRenderer.on('file-content', (event, content) => {
  document.getElementById('textArea').value = content; // Set textarea value with file content
});
