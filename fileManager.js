//renderer.js
const { ipcRenderer } = require("electron");


const fsSpan = document.getElementById('fs');
const chDir = document.createElement('button');
chDir.textContent = 'Open Folder';

chDir.style.backgroundColor = '#0078d4';
chDir.style.borderColor = '#0078d4';
chDir.style.color = 'white'

chDir.addEventListener('click', () => {
  ipcRenderer.send('open-folder-dialog');
});

const addFile = document.createElement('button');
addFile.textContent = 'Add';
addFile.addEventListener('click', addfile);

addFile.style.backgroundColor = '#0078d4';
addFile.style.borderColor = '#0078d4';
addFile.style.color = 'white'

const returnBtn = document.createElement('button');
returnBtn.textContent = 'return';

returnBtn.addEventListener('click', () => {
  ipcRenderer.send('return-to-parent-directory');
});

fsSpan.append(returnBtn);
fsSpan.appendChild(chDir);
fsSpan.appendChild(addFile);










//Function to add a file into the current directory 
function addfile() {
  const fss = document.getElementById('fs');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.style.width = "80px"; 
  textArea.style.height = "20px";
  textArea.placeholder = "fileName";
  textArea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && textArea.value.trim() !== '') {
      const newButton = document.createElement('button');
      newButton.textContent = textArea.value;
      newButton.addEventListener('click', () => openFile(textArea.value));
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newButton);
      fss.appendChild(buttonWrapper);
      textArea.remove();

      ipcRenderer.send('file-creation-request', textArea.value);

      // Attach click event listener for the newly created file button
      newButton.addEventListener('click', () => {
        ipcRenderer.send('file-button-clicked', textArea.value);
      });
    }
  });
  fss.appendChild(textArea);
}


//Send file name clicked from fileManager.js
ipcRenderer.on('files-in-directory', (event, files) => {
  fsSpan.innerHTML = ''; // Clear previous content
  fsSpan.appendChild(addFile); // Re-append 'Add File' button
  fsSpan.appendChild(returnBtn);
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
  fsSpan.insertBefore(chDir ,fsSpan.firstChild);
});




let filePath;
// Listen for the file-path event from the main process
ipcRenderer.on('file-path', (event, filepath) => {
  filePath = filepath;
  console.log('Received filePath in renderer:', filepath);

});




const fileContentPre = document.getElementById('editor');


ipcRenderer.on('file-content', (event, content) => {
  fileContentPre.textContent = content; // Set preformatted content with file content
});

function saveChanges() {
  let updatedContent = fileContentPre.innerHTML; // Get updated content from the pre element
  updatedContent = updatedContent.replace(/<div>/g, '\n'); // Replace <div> with newline
  updatedContent = updatedContent.replace(/<\/div>/g, ''); // Remove </div>
  updatedContent = updatedContent.replace(/<br>/g, '\n'); // Replace <br> with newline

  // Decode HTML entities back to their original characters
  const parser = new DOMParser();
  const decodedContent = parser.parseFromString(`<!doctype html><body>${updatedContent}`, 'text/html').body.textContent;
  
  ipcRenderer.send('save-file', { filePath, content: decodedContent });
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
