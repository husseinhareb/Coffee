const sideBar = document.getElementById('sideBar');
const settings = document.createElement('button');
const folder = document.createElement('button');

let fsVisibility = true;

fetch('./symbols.json')
  .then(response => response.json())
  .then(data => {
    settings.innerHTML = data['settingsSymbol'];
    folder.innerHTML = data['sideFolder'];
  })
  .catch(error => console.log('Error fetching data:', error));

settings.className = 'settings';
folder.className = 'folder';
settings.title = 'Settings';
folder.title = 'Workspace';
folder.style.borderLeft = 'solid 2px #959cbd';

folder.addEventListener('click', () => {
  const fs = document.getElementById('fs');
  if (fsVisibility) {
    folder.style.borderLeft = 'solid 0px';
    fs.style.width = '0px';
    fs.style.borderWidth = '0px';
  } else {
    folder.style.borderLeft = 'solid 2px #959cbd';
    fs.style.width = '200px';
    fs.style.borderWidth = '3px';
  }
  fsVisibility = !fsVisibility;
});
settings.addEventListener('click', settingsWindow);

let settingsWindowVisible = false;

function settingsWindow() {
  if (!settingsWindowVisible) {
    var settingsWindow = document.createElement('div');
    settingsWindow.className = 'settingsWindow';
    sideBar.appendChild(settingsWindow);
  } else {
    var settingsWindow = document.querySelector('.settingsWindow');
    settingsWindow.parentNode.removeChild(settingsWindow);
  }

  settingsWindowVisible = !settingsWindowVisible;
  let themeToggle = document.createElement('input');
  themeToggle.type = 'checkbox';
  themeToggle.id = 'themeToggle';
  themeToggle.checked = false;
  settingsWindow.appendChild(themeToggle);
  themeToggle.addEventListener('change', changeTheme);

  var closeButton = document.createElement('button');
  closeButton.textContent = 'x';
  closeButton.className = 'closingButton'
  closeButton.addEventListener('click', () => {
    settingsWindow.remove();
    settingsWindowVisible = !settingsWindowVisible;
  });
  settingsWindow.appendChild(closeButton);
}

function changeTheme() {
  const elementsToToggle = [
    { type: 'id', name: 'fs' },
    { type: 'id', name: 'editor' },
    { type: 'id', name: 'bottomBar' },
    { type: 'id', name: 'sideBar' },
    { type: 'id', name: 'topBar' },
    { type: 'className', name: 'returnBtn' },
    { type: 'className', name: 'addFile' },
    { type: 'className', name: 'addFolder' },
    { type: 'className', name: 'reloadFolder' },
    { type: 'className', name: 'changeDir' },
    { type: 'className', name: 'settings' },
    { type: 'className', name: 'folder' },
    ...Array.from(document.getElementsByClassName('fileDiv'))
  ];

  elementsToToggle.forEach(({ type, name }) => {
    if (type === 'id') {
      const elementById = document.getElementById(name);
      if (elementById) {
        elementById.classList.toggle('light');
      }
    } else if (type === 'className' || type === 'class') {
      const elementsByClassName = document.getElementsByClassName(name);
      Array.from(elementsByClassName).forEach(elementByClass => {
        elementByClass.classList.toggle('light');
      });
    }
  });

  // Toggle theme for fileDiv elements
  toggleFileDivTheme();
}

// Function to toggle theme for fileDiv elements
function toggleFileDivTheme() {
  const fileDivs = document.getElementsByClassName('fileDiv');
  Array.from(fileDivs).forEach(fileDiv => {
    fileDiv.classList.toggle('light');
  });
}

toggleFileDivTheme();

function addFileDiv() {

  toggleFileDivTheme();
}

// Append buttons to sidebar
sideBar.appendChild(folder);
sideBar.appendChild(settings);
