//renderer.js
const { ipcRenderer } = require('electron');
const { createWriteStream } = require('original-fs');

const fsSpan = document.getElementById('fs');

const returnDiv = document.createElement('div');

const returnBtn = document.createElement('button');
returnBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
returnBtn.className = "returnBtn";
returnBtn.addEventListener('click', () => {
  ipcRenderer.send('return-to-parent-directory');
});

returnDiv.appendChild(returnBtn);

fsSpan.appendChild(returnDiv);


const buttonsDiv = document.createElement('div');
buttonsDiv.className = "buttonsDiv";
const chDir = document.createElement('button');
chDir.className="changeDir"
chDir.innerHTML = '<i class="fa-solid fa-folder-open"></i>Open Folder';
chDir.addEventListener('click', () => {
  ipcRenderer.send('open-folder-dialog');
});
buttonsDiv.appendChild(chDir);

const addFile = document.createElement('button');
addFile.innerHTML = '<i class="nf-cod-new_file"></i>';
addFile.className = "addFile";
addFile.addEventListener('click', addfile);
buttonsDiv.appendChild(addFile);


const addFolder = document.createElement('button');
addFolder.innerHTML = '<i class="nf-cod-new_folder"></i>';
addFolder.className = "addFile";
addFolder.addEventListener('click', addfolder);
buttonsDiv.appendChild(addFolder);

const reloadFolder = document.createElement('button');
reloadFolder.innerHTML = '<i class="nf-md-reload"></i>';
reloadFolder.className = "addFile";
reloadFolder.addEventListener('click', () => {
  ipcRenderer.send('reload-folder');
});

buttonsDiv.appendChild(reloadFolder);
fsSpan.appendChild(buttonsDiv);



function addfolder() {
  const fss = document.getElementById('fs');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.placeholder = "foldername";
  textArea.className="folderArea";
  textArea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && textArea.value.trim() !== '') {
      const folderName = textArea.value.trim(); // Get the folder name

      // Remove the text area before sending the request
      textArea.remove();

      // Create a button for the folder (if needed)
      const newButton = document.createElement('button');
      newButton.className = "filesButtons"; // Add class for styling if required
      newButton.textContent = folderName;
      newButton.addEventListener('click', () => {
        // Handle folder button click here if needed
        ipcRenderer.send('file-button-clicked', folderName);
      });

      // Create a wrapper for the button and append it
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newButton);
      fss.appendChild(buttonWrapper);

      // Send the folder creation request after UI updates
      ipcRenderer.send('folder-creation-request', folderName);
    }
  });

  fss.appendChild(textArea);
  textArea.focus();
}



function addfile() {
  const fss = document.getElementById('fs');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.placeholder = "fileName";
  textArea.className = "fileArea";
  textArea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && textArea.value.trim() !== '') {
      const newDiv = document.createElement('div');
      const fileType = getFileType(textArea.value);
      console.log(fileType);
      fetch('./symbols.json')
        .then(response => response.json())
        .then(data => {
          let symbol = data[fileType] || " ";
          console.log(symbol);
          newDiv.innerHTML = symbol + " " + textArea.value; 

        })
        .catch(error => console.error('Error fetching data:', error));

      newDiv.className = "fileDiv";
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newDiv);
      fss.appendChild(buttonWrapper);
      textArea.remove();

      ipcRenderer.send('file-creation-request', textArea.value);

      newDiv.addEventListener('click', () => {
        ipcRenderer.send('file-button-clicked', textArea.value);

      });
    }

  });


  fss.appendChild(textArea);
  textArea.focus();
}


let previousButton = null;
ipcRenderer.on('files-in-directory', (event, files) => {
  fsSpan.innerHTML = ''; // Clear previous content

  // Append returnBtn
  returnDiv.appendChild(returnBtn);
  fsSpan.appendChild(returnDiv);

  // Append chDir and addFile to buttonsDiv
  buttonsDiv.appendChild(chDir);
  buttonsDiv.appendChild(addFile);
  buttonsDiv.appendChild(addFolder);
  buttonsDiv.appendChild(reloadFolder);
  fsSpan.appendChild(buttonsDiv);
  
  files.forEach(fileName => {
    const fileDiv = document.createElement('div');
    const fileNameText = document.createElement('span');
    const settButton = document.createElement('button');

    fileDiv.className = "fileDiv";
    fileDiv.style.display = 'flex'; 
    fileDiv.style.position = 'relative'; 

    fileNameText.textContent = fileName; 
    fileNameText.style.overflow = 'hidden';
    fileNameText.style.textOverflow = 'ellipsis'; 
    fileNameText.style.whiteSpace = 'nowrap'; 

    fileDiv.appendChild(fileNameText);

    settButton.innerHTML = '<i class="nf-oct-three_bars"></i>'; 
    settButton.className = 'settButton';
    settButton.style.position = 'absolute'; 
    settButton.style.right = '0'; 
    settButton.style.display = 'none';

    fileDiv.appendChild(settButton); 


    const fileType = getFileType(fileName);
    console.log(fileType);
    fetch('./symbols.json')
      .then(response => response.json())
      .then(data => {
        let symbol = data[fileType] || " ";
        console.log(symbol);
        fileNameText.innerHTML = symbol + " " + fileName;
      })
      .catch(error => console.error('Error fetching data:', error));

    fileDiv.addEventListener('click', () => {
      if (previousButton !== null) {
        previousButton.style.backgroundColor = ''; 
        previousButton.getElementsByClassName('settButton')[0].style.display = 'none'; 
      }

      fileDiv.style.backgroundColor = '#292e42';
      settButton.style.display = 'block';

      previousButton = fileDiv;

      ipcRenderer.send('file-button-clicked', fileName);
    });

    settButton.addEventListener('click', (event) => {
      // Prevent the click event from propagating to the fileDiv
      event.stopPropagation();
    
      // Get the parent fileDiv of the clicked settButton
      const fileDiv = event.currentTarget.parentNode;
    
      // Call settingsPanel with the fileDiv and fileName
      settingsPanel(fileDiv, fileName);
    });
    

    fsSpan.appendChild(fileDiv); 
  });
});

function settingsPanel(fileDiv, fileName) {
  // Get the position of the fileDiv relative to the viewport
  const fileRect = fileDiv.getBoundingClientRect();
  console.log("filo namo",fileName);
  // Create a settings div
  const settingsDiv = document.createElement('div');
  settingsDiv.className = 'settingsDiv';
  settingsDiv.style.position = 'absolute';

  settingsDiv.style.top = `${fileRect.top}px`; // Adjust as needed
  settingsDiv.style.left = `${fileRect.right}px`; // Adjust as needed
  settingsDiv.style.padding = '10px';
  settingsDiv.style.zIndex = '999'; 


  const renameButton = document.createElement('button');
  renameButton.innerHTML = '<i class="nf-md-rename_box"></i> Rename';
  renameButton.className = 'renameButton'
  
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="nf-md-delete"></i> Delete';
  deleteButton.className = 'deleteButton'
  
  deleteButton.addEventListener('click', () => {
    ipcRenderer.send('delete-file', fileName);
    ipcRenderer.send('reload-folder');

     // Sending a request to delete the file
  });
  // Append buttons to settingsDiv
  settingsDiv.appendChild(renameButton);
  settingsDiv.appendChild(deleteButton);


  document.body.appendChild(settingsDiv);

  const closeSettingsDiv = () => {
    document.body.removeChild(settingsDiv);
    // Optionally, you can remove the event listener after closing
    document.removeEventListener('click', clickOutsideHandler);
  };

  // Event listener function to handle clicks outside settingsDiv
  const clickOutsideHandler = (event) => {
    if (!settingsDiv.contains(event.target) && event.target !== fileDiv) {
      // Click occurred outside settingsDiv and fileDiv
      closeSettingsDiv();
    }
  };

  // Add click event listener to the document
  document.addEventListener('click', clickOutsideHandler);
}

ipcRenderer.on('file-deletion-success', (event, fileName) => {
  // Handle deletion success in the renderer process, like removing UI elements, etc.
  console.log(`File "${fileName}" deleted successfully`);
});

ipcRenderer.on('file-deletion-error', (event, errorMessage) => {
  // Handle deletion error in the renderer process, like showing an alert, etc.
  console.error('Error deleting file:', errorMessage);
});


let filePath;

ipcRenderer.on('file-path', (event, filepath) => {
  filePath = filepath;
  console.log('Received filePath in renderer:', filepath);

});

ipcRenderer.on('file-content', (event, fileData) => {
  const { fileName, content } = fileData;
  getLangName(fileName)
    .then(lang => {
      const language = lang;
      ace.config.set("basePath", "./node_modules/ace-builds/src/ace.js");
      const editor = ace.edit("editor");
      editor.setTheme("ace/theme/monokai"); 
      editor.session.setMode(`ace/mode/${language}`);
      editor.setValue(content);

      // Get the existing language button or create a new one
      const bottom = document.getElementById('buttomBar');
      let languageButton = bottom.querySelector('.languageName');
      if (!languageButton) {
        languageButton = document.createElement('button');
        languageButton.className = "languageName";
        bottom.appendChild(languageButton);
      }
      languageButton.textContent = language;

      // Get the existing line and column button or create a new one
      let lns = bottom.querySelector('.lineColumn');
      if (!lns) {
        lns = document.createElement('button');
        lns.className = "lineColumn";
        bottom.appendChild(lns);
      }

      // Listen to changes in the editor content
      editor.getSession().on('change', () => {
        const cursorPos = editor.getCursorPosition();
        lns.textContent = `Line: ${cursorPos.row + 1}, Column: ${cursorPos.column}`;
      });
    })
    .catch(err => {
      console.error("Error:", err);
      // Handle errors occurring during language retrieval
    });
});



function saveChanges() {
  const editor = ace.edit("editor"); 
  const updatedContent = editor.getValue();

  
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



function getFileType(name) {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex !== -1) {
    return name.substring(dotIndex + 1);
  }
  return '';
}

function getLangName(name) {
  const fileExtension = getFileType(name);
  return fetch('./languages.json')
    .then(response => response.json())
    .then(data => {
      let lang = data[fileExtension] || '';
      return lang;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return ''; // Return an empty string or handle the error as needed
    });
}