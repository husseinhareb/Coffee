//renderer.js
const { ipcRenderer } = require('electron');

var fsSpan = document.getElementById('fs');

var returnBtn = document.createElement('button');
returnBtn.className = "returnBtn";
returnBtn.title = "Parent Directory";

var chDir = document.createElement('button');
chDir.className = "changeDir";
chDir.title = "Open Folder";

var addFile = document.createElement('button');
addFile.className = "addFile";
addFile.title = "New File";

var addFolder = document.createElement('button');
addFolder.className = "addFolder";
addFolder.title = "New Folder";

var reloadFolder = document.createElement('button');
reloadFolder.className = "reloadFolder";
reloadFolder.title = "Reload Folder";

var buttonsDiv = document.createElement('div');
var rightDiv = document.createElement('div');
var leftDiv = document.createElement('div');
buttonsDiv.className = "buttonsDiv";



leftDiv.appendChild(chDir);
rightDiv.appendChild(addFile);
rightDiv.appendChild(addFolder);
rightDiv.appendChild(reloadFolder);

buttonsDiv.appendChild(leftDiv);
buttonsDiv.appendChild(rightDiv);

var returnDiv = document.createElement('div');
returnDiv.appendChild(returnBtn);

fsSpan.appendChild(returnDiv);
fsSpan.appendChild(buttonsDiv);

fetch('./symbols.json')
  .then(response => response.json())
  .then(data => {
    returnBtn.innerHTML = data['returnBtn'];
    chDir.innerHTML = data['chDir'];
    addFile.innerHTML = data['addFile'];
    addFolder.innerHTML = data['addFolder'];
    reloadFolder.innerHTML = data['reloadFolder'];
  })
  .catch(error => console.log('Error fetching data:', error));

returnBtn.addEventListener('click', () => {
  ipcRenderer.send('return-to-parent-directory');
  clickedFiles = [];
  topBar.innerHTML = '';
});

chDir.addEventListener('click', () => {
  ipcRenderer.send('open-folder-dialog');
  clickedFiles = [];
  topBar.innerHTML = '';
});

addFile.addEventListener('click', addfile);
addFolder.addEventListener('click', addfolder);

reloadFolder.addEventListener('click', () => {
  ipcRenderer.send('reload-folder');
});


function addfolder() {
  const fss = document.getElementById('fs');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.placeholder = "foldername";
  textArea.className = "folderArea";
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
      ipcRenderer.send('reload-folder');

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
        .catch(error => console.log('Error fetching data:', error));

      newDiv.className = "fileDiv";
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newDiv);
      fss.appendChild(buttonWrapper);
      textArea.remove();

      ipcRenderer.send('file-creation-request', textArea.value);

      newDiv.addEventListener('click', () => {
        ipcRenderer.send('file-button-clicked', textArea.value);

      });

      ipcRenderer.send('reload-folder');
    }

  });


  fss.appendChild(textArea);
  textArea.focus();
}

function displayFileContent(fileName, fileDiv, settButton) {
  if (previousButton !== null) {
    settButton.style.display = 'none'
    previousButton.style.backgroundColor = '';
  }
  fileDiv.style.backgroundColor = '#292e42';
  settButton.style.display = 'block';

  previousButton = fileDiv;
  console.log(fileName);
  ipcRenderer.send('file-button-clicked', fileName);

  console.log("testing testing");
}


let folder_list = [];

ipcRenderer.on('folders-in-directory-result', (event, folderList) => {
  if (folderList.length > 0) {
    console.log('Folders in the directory:', folderList);
    folder_list = folderList;
  } else {
    console.log('No folders found in the directory.');
  }
});

console.log("global", folder_list);


let previousButton = null;
let clickedFiles = [];
let currentSettButton = null;

ipcRenderer.on('files-in-directory', (event, files) => {
  fsSpan.innerHTML = ''; // Clear previous content

  // Append chDir and addFile to buttonsDiv
  leftDiv.appendChild(chDir);
  rightDiv.appendChild(addFile);
  rightDiv.appendChild(addFolder);
  rightDiv.appendChild(reloadFolder);

  buttonsDiv.appendChild(leftDiv);
  buttonsDiv.appendChild(rightDiv);

  returnDiv.appendChild(returnBtn);
  // Append returnBtn
  fsSpan.appendChild(returnDiv);
  fsSpan.appendChild(buttonsDiv);
  files.forEach(fileName => {

    const fileDiv = document.createElement('div');
    const fileNameText = document.createElement('span');
    var settButton = document.createElement('button');

    fileDiv.className = "fileDiv";
    fileDiv.style.display = 'flex';
    fileDiv.style.position = 'relative';

    fileNameText.textContent = fileName;
    fileNameText.style.overflow = 'hidden';
    fileNameText.style.textOverflow = 'ellipsis';
    fileNameText.style.whiteSpace = 'nowrap';
    fileNameText.className = "fileNameText";

    fileDiv.appendChild(fileNameText);

    settButton.className = 'settButton';
    settButton.style.position = 'absolute';
    settButton.style.right = '0';
    settButton.style.display = 'none';

    fileDiv.appendChild(settButton);
    const fileType = getFileType(fileName);


    fetch('./symbols.json')
      .then(response => response.json())
      .then(data => {
        settButton.innerHTML = data['settButton'];
        let symbol = data[fileType] || " ";
        console.log(symbol);
        fileNameText.innerHTML = symbol + " " + fileName;
        //Folder icon handling
        if (folder_list.includes(fileName)) {
          console.log("Folder found in folder_list:", fileName);
          fileNameText.innerHTML = data['folder'] + " " + fileName;
        } else {
          console.log("Folder not found in folder_list:", fileName);
        }
      })
      .catch(error => console.error('Error fetching data:', error));

    fileDiv.addEventListener('click', () => {
      displayFileContent(fileName, fileDiv, settButton);
      if (!clickedFiles.includes(fileName)) {
        clickedFiles.push(fileName);
        updateTopBar(fileName, fileDiv, settButton); // Pass fileName, fileDiv, and settButton to updateTopBar
      }
      if (currentSettButton && currentSettButton !== settButton) {
        currentSettButton.style.display = 'none'; // Hide the previous settButton if it's not the same as the current one
      }
      currentSettButton = settButton;
    });

    fileDiv.addEventListener('contextmenu', function (event) {
      event.preventDefault();

      console.log('Right-clicked!');
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


function updateTopBar(clickedFile, fileDiv, settButton) {
  // Check if the clicked file is a folder
  if (isDirectory(clickedFile)) {
    topBar.innerHTML = '';
    clickedFiles = [];
    return; // If it's a folder, don't add it to the topBar
  }

  topBar.innerHTML = '';
  const fetchSymbolPromises = clickedFiles.map(file => {
    const fileType = getFileType(file);
    return fetch('./symbols.json')
      .then(response => response.json())
      .then(data => {
        let symbol = data[fileType] || " ";
        return { symbol, fileName: file };
      })
      .catch(error => {
        console.log('Error fetching data:', error);
        return { symbol: "", fileName: "" };
      });
  });

  Promise.all(fetchSymbolPromises)
    .then(fileButtonsContent => {
      fileButtonsContent.forEach(({ symbol, fileName }) => {
        const fileButton = document.createElement('button');
        fileButton.innerHTML = symbol + " " + fileName; // Display symbol and file name
        fileButton.className = "topFiles";

        // Create close button (X) next to each file name
        const closeButton = document.createElement('button');
        closeButton.innerHTML = 'X';
        closeButton.className = "closeButton";
        closeButton.addEventListener('click', (event) => {
          event.stopPropagation();
          closeFile(fileName);
        });

        // Create a container to hold both the file name and close button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = "fileButtonContainer";
        buttonContainer.appendChild(fileButton);
        buttonContainer.appendChild(closeButton);

        buttonContainer.addEventListener('click', () => {
          if (isDirectory(fileName)) {
            // Handle directory click if needed
            console.log('Directory clicked:', fileName);
          } else {
            console.log('File clicked:', fileName);
            displayFileContent(fileName, fileDiv, settButton);
          }
        });

        topBar.appendChild(buttonContainer);
      });
    });
}


function closeFile(fileName) {
  // Remove the closed file from the clickedFiles array
  const index = clickedFiles.indexOf(fileName);
  if (index !== -1) {
    clickedFiles.splice(index, 1);
  }

  // Update the top bar to reflect the changes
  updateTopBar();
}




// Assuming the isDirectory function is defined in your code
function isDirectory(fileName) {
  return folder_list.includes(fileName);
}





function settingsPanel(fileDiv, fileName) {
  // Get the position of the fileDiv relative to the viewport
  const fileRect = fileDiv.getBoundingClientRect();
  console.log("filo namo", fileName);
  // Create a settings div
  const settingsDiv = document.createElement('div');
  settingsDiv.className = 'settingsDiv';
  settingsDiv.style.position = 'absolute';

  settingsDiv.style.top = `${fileRect.top}px`;
  settingsDiv.style.left = `${fileRect.right}px`;
  settingsDiv.style.padding = '4px';
  settingsDiv.style.zIndex = '999';


  const renameButton = document.createElement('button');
  renameButton.innerHTML = 'Rename';
  renameButton.className = 'renameButton'

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete';
  deleteButton.className = 'deleteButton'

  deleteButton.addEventListener('click', () => {
    ipcRenderer.send('delete-file', fileName);
    ipcRenderer.send('reload-folder');
  });

  settingsDiv.appendChild(renameButton);
  settingsDiv.appendChild(deleteButton);


  document.body.appendChild(settingsDiv);

  const closeSettingsDiv = () => {
    document.body.removeChild(settingsDiv);
    document.removeEventListener('click', clickOutsideHandler);
  };

  const clickOutsideHandler = (event) => {
    if (!settingsDiv.contains(event.target) && event.target !== fileDiv) {
      closeSettingsDiv();
    }
  };

  deleteButton.addEventListener('click', () => {
    ipcRenderer.send('delete-file', fileName);
    ipcRenderer.send('reload-folder');
    closeSettingsDiv();
  });

  renameButton.addEventListener('click', () => {
    const fileNameText = fileDiv.querySelector('.fileNameText'); // Get the existing span containing the file name

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = fileName; // Set the initial value as the current filename
    inputElement.className = 'renameInput';

    inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const newFileName = inputElement.value.trim();
        fileNameText.textContent = newFileName; // Update the span with the new file name
        ipcRenderer.send('rename-file', { oldFileName: fileName, newFileName });
        ipcRenderer.send('reload-folder');
        closeSettingsDiv();
      }
    });

    fileDiv.replaceChild(inputElement, fileNameText); // Replace the span with the input element
    inputElement.focus();
  });


  document.addEventListener('click', clickOutsideHandler);
}





ipcRenderer.on('file-deletion-success', (event, fileName) => {
  // Handle deletion success in the renderer process, like removing UI elements, etc.
  console.log(`File "${fileName}" deleted successfully`);
});

ipcRenderer.on('file-deletion-error', (event, errorMessage) => {
  // Handle deletion error in the renderer process, like showing an alert, etc.
  console.log('Error deleting file:', errorMessage);
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
      const bottom = document.getElementById('bottomBar');
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

      // Listen to changes in the cursor position (selection)
      editor.getSelection().on('changeCursor', () => {
        const cursorPos = editor.getCursorPosition();
        lns.textContent = `Line: ${cursorPos.row + 1}, Column: ${cursorPos.column}`;
      });
    })
    .catch(err => {
      console.log("Error:", err);
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
      console.log('Error fetching data:', error);
      return '';
    });
}



const fs = document.getElementById('fs');
let isResizing = false;
let startX, startWidth;

function handleMouseMove(e) {
  if (!isResizing) return;

  const newWidth = startWidth + e.clientX - startX;
  fs.style.width = newWidth + 'px';
  fs.style.borderRight = "5px solid #29355a";
}

fs.addEventListener('mousemove', (e) => {
  const isNearRightEdge = e.offsetX > fs.offsetWidth - 6;
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    fs.style.transition = "border-right 0.5s ease";
    fs.style.borderRight = isNearRightEdge ? "5px solid #29355a" : "3px solid #1b1e2e";
  }, 300);
  fs.style.cursor = isNearRightEdge ? "col-resize" : "default";
});

fs.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout);

  fs.style.transition = "border-right 0.5s ease";
  fs.style.borderRight = "3px solid #1b1e2e";

  setTimeout(() => {
    fs.style.transition = "none";
  }, 300);
});

fs.addEventListener('mousedown', (e) => {
  const isNearRightEdge = e.offsetX > fs.offsetWidth - 6;
  if (isNearRightEdge) {
    isResizing = true;
    startX = e.clientX;
    startWidth = fs.offsetWidth;
    document.addEventListener('mousemove', handleMouseMove);
  }
});

document.addEventListener('mouseup', () => {
  isResizing = false;
  document.removeEventListener('mousemove', handleMouseMove);
  fs.style.borderRight = "3px solid #1b1e2e";

});