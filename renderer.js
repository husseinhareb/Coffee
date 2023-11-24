document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('editor');

  // Function to load a file into the editor
  function loadFile(filePath) {
    const fs = require('fs');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        alert('An error occurred while loading the file!');
        return;
      }
      textarea.value = data;
    });
  }

  // Function to save the content to a file
  function saveFile(filePath, content) {
    const fs = require('fs');
    fs.writeFile(filePath, content, 'utf-8', err => {
      if (err) {
        alert('An error occurred while saving the file!');
      } else {
        alert('File saved successfully!');
      }
    });
  }

  // Event listener for when the user changes the content
  textarea.addEventListener('input', event => {
    // Do something with the updated content (e.g., save to memory or update UI)
  });

  // Example: Open a file dialog to load a file
  document.getElementById('openFile').addEventListener('click', () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog({
      properties: ['openFile']
    }).then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        loadFile(filePath);
      }
    }).catch(err => {
      console.log(err);
    });
  });

  // Example: Save the content to a file
  document.getElementById('saveFile').addEventListener('click', () => {
    const { dialog } = require('electron').remote;
    dialog.showSaveDialog({
      defaultPath: 'untitled.txt'
    }).then(result => {
      if (!result.canceled && result.filePath) {
        const filePath = result.filePath;
        const content = textarea.value;
        saveFile(filePath, content);
      }
    }).catch(err => {
      console.log(err);
    });
  });
});
