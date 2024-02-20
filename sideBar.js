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

function settingsWindow(){
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
  closeButton.textContent= 'x';
  closeButton.addEventListener('click', () => {
    settingsWindow.remove();
    settingsWindowVisible = !settingsWindowVisible;

  })
  settingsWindow.appendChild(closeButton);
}

function changeTheme(){
    const fs = document.getElementById('fs');
    const editor = document.getElementById('editor');
    const bottom = document.getElementById('bottomBar');
    const sideBar = document.getElementById('sideBar');
    const topBar = document.getElementById('topBar');
    const returnBtns = document.getElementsByClassName('returnBtn');
    const returnBtn = returnBtns[0];
    const addFiles = document.getElementsByClassName('addFile');
    const addFile = addFiles[0];
    const addFolders = document.getElementsByClassName('addFolder');
    const addFolder = addFolders[0];
    const reloadFolders = document.getElementsByClassName('reloadFolder');
    const reloadFolder = reloadFolders[0];
    const changeDirs = document.getElementsByClassName('changeDir');
    const changeDir = changeDirs[0];
    fs.classList.toggle("light");
    editor.classList.toggle("light");
    bottom.classList.toggle("light");
    sideBar.classList.toggle("light");
    topBar.classList.toggle("light");
    returnBtn.classList.toggle("light");
    addFile.classList.toggle("light");
    addFolder.classList.toggle("light");
    reloadFolder.classList.toggle("light");
    changeDir.classList.toggle("light");
  }

sideBar.appendChild(folder);
sideBar.appendChild(settings);