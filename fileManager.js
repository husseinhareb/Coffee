//renderer.js
const { ipcRenderer } = require("electron");

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
chDir.innerHTML = '<i class="fa-solid fa-folder-open"></i> Open Folder';
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

fsSpan.appendChild(buttonsDiv);




function addfolder() {
  const fss = document.getElementById('fs');
  const textArea = document.createElement('input');
  textArea.type = "text";
  textArea.style.width = "80px"; 
  textArea.style.height = "20px";
  textArea.placeholder = "foldername";
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
}




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
      const fileType = getFileType(textArea.value);
      console.log(fileType);
      fetch('./symbols.json')
        .then(response => response.json())
        .then(data => {
          let symbol = data[fileType] || " ";
          console.log(symbol);
          newButton.innerHTML = symbol + " " + textArea.value;

      })
      .catch(error => console.error('Error fetching data:', error));

      newButton.className="filesButtons"
      const buttonWrapper = document.createElement('div');
      buttonWrapper.appendChild(newButton);
      fss.appendChild(buttonWrapper);
      textArea.remove();

      ipcRenderer.send('file-creation-request', textArea.value);

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
  // Append returnBtn
  returnDiv.appendChild(returnBtn);
  fsSpan.appendChild(returnDiv);

    // Append chDir and addFile to buttonsDiv
    buttonsDiv.appendChild(chDir);
    buttonsDiv.appendChild(addFile);
    buttonsDiv.appendChild(addFolder);
    fsSpan.appendChild(buttonsDiv);
  files.forEach(fileName => {
    const fileButton = document.createElement('button');
    const fileType = getFileType(fileName);
      console.log(fileType);
      fetch('./symbols.json')
        .then(response => response.json())
        .then(data => {
          let symbol = data[fileType] || " ";
          console.log(symbol);
          fileButton.innerHTML = symbol + " "+ fileName;

      })
      .catch(error => console.error('Error fetching data:', error));

    fileButton.className = "filesButtons"
    fileButton.style.display = 'block'; // Set the display to block
    fileButton.addEventListener('click', () => {
      // Send the filename to the main process
      ipcRenderer.send('file-button-clicked', fileName);
    });
    fsSpan.appendChild(fileButton);
  });

});





let filePath;
// Listen for the file-path event from the main process
ipcRenderer.on('file-path', (event, filepath) => {
  filePath = filepath;
  console.log('Received filePath in renderer:', filepath);

});






ipcRenderer.on('file-content', (event, fileData) => {
  const { fileName, content } = fileData;

  // Displaying the file name and content in fileContentPre element
  //fileContentPre.textContent = content;
  getLangName(fileName)
    .then(lang => {
      const language = lang;

      fetch(`./languages/${language}/keywords.json`)
        .then(response => response.json())
        .then(keywordsData => {
          // Split the text into lines and preserve line breaks
          const lines = content.split('\n');
          const highlightedLines = lines.map(line => {
            // Split each line into words
            const words = line.split(/\s+/);

            // Function to wrap the words with spans and apply classes for each category
            function highlightKeywordsByCategory(text, category, cssClass) {
              keywordsData[category].forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                text = text.replace(regex, `<span class="${cssClass}">${keyword}</span>`);
              });
              return text;
            }

            // Apply highlighting for each category to the text content
            Object.keys(keywordsData).forEach(category => {
              line = highlightKeywordsByCategory(line, category, `highlight-${category.toLowerCase()}`);
            });

            return line;
          });

          // Get the div element to display the content
          const fileContentPre = document.getElementById('editor');

          // Display the highlighted content in the div with line breaks
          fileContentPre.innerHTML = highlightedLines.join('<br>');
        })
        .catch(error => console.error('Error loading keywords:', error));
    })
    .catch(error => console.error('Error getting language:', error));
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



function getFileType(name) {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex !== -1) {
    return name.substring(dotIndex + 1);
  }
  return '';
}

function getLangName(name) {
  const fileExtension = getFileType(name);
  return fetch('./languages/languages.json')
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

